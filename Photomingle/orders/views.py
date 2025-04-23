import hashlib
import os
import uuid

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .authenticate import IsAuthenticatedViaJWT
from django.db.models import Q, Sum, F
from .models import Order, OrderStatus, Image, PrintFormat
from .serializers import OrderSerializer, ImageSerializer, PrintFormatSerializer
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

class MyOrdersView(APIView):
    permission_classes = [IsAuthenticatedViaJWT]

    def generate_shortcut_url(self):
        raw_uuid = uuid.uuid4().hex  # сырой UUID
        hash_object = hashlib.md5(raw_uuid.encode())
        return hash_object.hexdigest()[:8]  # первые 8 символов хэша

    def get(self, request):
        user = request.user
        orders = Order.objects.filter(Q(owner=user) | Q(guest_users__in=[user])).distinct()
        order_ids = [f"order-{order.id}" for order in orders]
        order_names = [order.name for order in orders]
        return Response({
            "order_ids": order_ids,
            "order_names": order_names
        })

    def post(self, request):
        user = request.user
        name = request.data.get("name")

        if not name:
            return Response({"error": "Name is required."}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.create(
            name=name,
            owner=user,
            shortcut_url=self.generate_shortcut_url(),
            status=OrderStatus.IN_CREATION
        )

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)

class OrderDetailView(APIView):
    permission_classes = [IsAuthenticatedViaJWT]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request, order_id):
        user = request.user
        try:
            uuid = order_id.replace("order-", "")  # удалить префикс
            order = get_object_or_404(
                Order,
                Q(id=uuid) & (Q(owner=user) | Q(guest_users__in=[user]))
            )
        except Exception:
            return Response({"detail": "Order not found or access denied"}, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderSerializer(order)

        # Считаем стоимость: сумма всех image.print_format.price
        total_price = order.images.aggregate(
            total=Sum(F('format__price'))
        )['total'] or 0

        # Добавляем стоимость к сериализованному ответу
        response_data = serializer.data
        response_data['total_price'] = total_price

        return Response(response_data)

    def put(self, request, order_id):
        user = request.user
        uuid = order_id.replace("order-", "")
        order = get_object_or_404(Order, Q(id=uuid) & (Q(owner=user) | Q(guest_users__in=[user])))

        image_file = request.FILES.get('file')
        if not image_file:
            return Response({"detail": "No image file provided."}, status=400)

        # Создаём объект Image и сохраняем файл в нужное место
        image = Image.objects.create(order=order, file=image_file)
        serializer = ImageSerializer(image)

        return Response(serializer.data, status=200)

    def delete(self, request, order_id):
        user = request.user
        image_id = request.data.get("image_id")

        if not image_id:
            return Response({"detail": "Image ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        uuid = order_id.replace("order-", "")
        order = get_object_or_404(Order, Q(id=uuid) & (Q(owner=user) | Q(guest_users__in=[user])))

        image_obj = Image.objects.filter(id=image_id, order=order).first()
        if not image_obj:
            return Response({"detail": "Image not found or does not belong to this order."},
                            status=status.HTTP_404_NOT_FOUND)
        image_path = image_obj.file.path
        os.remove(image_path)
        image_obj.delete()
        return Response({"detail": "Image deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

    def post(self, request, order_id):
        user = request.user
        try:
            uuid = order_id.replace("order-", "")  # удалить префикс
            order = get_object_or_404(
                Order,
                Q(id=uuid) & (Q(owner=user) | Q(guest_users__in=[user]))
            )
        except Exception:
            return Response({"detail": "Order not found or access denied"}, status=status.HTTP_404_NOT_FOUND)

        order.status = OrderStatus.IN_WORK
        order.save()

        serializer = OrderSerializer(order)

        total_price = order.images.aggregate(
            total=Sum(F('format__price'))
        )['total'] or 0

        response_data = serializer.data
        response_data['total_price'] = total_price

        return Response(response_data, status=status.HTTP_200_OK)
class OrderInviteJoinView(APIView):
    permission_classes = [IsAuthenticatedViaJWT]

    def get(self, request, shortcut_url):
        user = request.user
        order = get_object_or_404(Order, shortcut_url=shortcut_url)

        if user == order.owner:
            return Response({"detail": "Вы уже находитесь в учатниках этого заказа или являетесь его владельцем."})

        order.guest_users.add(user)
        return Response({"detail": "Вы добавлены в участники заказа.", "order_name": str(order.name)})

class AddImage(APIView):
    permission_classes = [IsAuthenticatedViaJWT]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, order_id):
        user = request.user
        try:
            uuid = order_id.replace("order-", "")
            order = get_object_or_404(
                Order,
                Q(id=uuid) & (Q(owner=user) | Q(guest_users__in=[user]))
            )
        except Exception:
            return Response({"detail": "Order not found or access denied"}, status=status.HTTP_404_NOT_FOUND)

        order_serializer = OrderSerializer(order)
        formats = PrintFormat.objects.all()
        formats_serializer = PrintFormatSerializer(formats, many=True)

        return Response({
            "order": order_serializer.data,
            "print_formats": formats_serializer.data
        })

    def put(self, request, order_id):
        user = request.user
        uuid = order_id.replace("order-", "")
        order = get_object_or_404(Order, Q(id=uuid) & (Q(owner=user) | Q(guest_users__in=[user])))

        image_file = request.FILES.get('image')
        if not image_file:
            return Response({"detail": "No image file provided."}, status=400)

        print_format_name = request.data.get('print_format')
        if not print_format_name:
            return Response({"detail": "Print format not provided."}, status=400)

        # Пытаемся найти формат по имени
        print_format = PrintFormat.objects.filter(name=print_format_name).first()
        if not print_format:
            return Response({"detail": "Invalid print format."}, status=400)

        # Создаём объект Image, связываем с форматом
        image = Image.objects.create(
            order=order,
            file=image_file,
            format=print_format  # предполагается наличие ForeignKey на PrintFormat
        )

        serializer = ImageSerializer(image)
        return Response(serializer.data, status=200)
