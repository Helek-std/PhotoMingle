import uuid

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Order, OrderStatus, Image
from .serializers import OrderSerializer, ImageSerializer
from rest_framework.parsers import MultiPartParser, FormParser

class MyOrdersView(APIView):
    permission_classes = [IsAuthenticated]

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
            shortcut_url=str(uuid.uuid4()),
            status=OrderStatus.IN_CREATION
        )

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)

class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

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
        return Response(serializer.data)

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