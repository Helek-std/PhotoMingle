from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import PrintFormat
from .services import get_user_orders, create_order, delete_order_image, complete_order, get_order_detail, \
    get_all_orders, delete_order, change_status
from .serializers import (
    OrderSearchInputSerializer,
    OrderListOutputSerializer,
    OrderCreateInputSerializer,
    OrderOutputSerializer, DeleteImageInputSerializer, CompleteOrderInputSerializer, OrderDetailSerializer,
    PrintFormatSerializer,
)

class OrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = OrderSearchInputSerializer(data=request.GET)
        serializer.is_valid(raise_exception=True)

        search_query = serializer.validated_data.get("search", "")
        if serializer.validated_data["admin_request"] and request.user.is_staff:
            orders = get_user_orders(None, search_query)
        else:
            orders = get_user_orders(request.user, search_query)

        output = OrderListOutputSerializer({
            "order_ids" : [str(order.id) for order in orders],
            "order_names": [o.name for o in orders],
            "order_users": [o.owner.email if o.owner else "—" for o in orders],
            "order_status": [ o.get_status_display() if o.status else "—" for o in orders],
        })
        return Response(output.data, status=status.HTTP_200_OK)


class OrderCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = OrderCreateInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = create_order(request.user, serializer.validated_data["name"])

        output = OrderOutputSerializer(order)
        return Response(output.data, status=status.HTTP_201_CREATED)

class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        order = get_order_detail(order_id, request.user)
        serializer = OrderDetailSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)


class OrderDeleteImageView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, order_id):
        serializer = DeleteImageInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = delete_order_image(order_id, serializer.validated_data["image_id"], request.user)
        return Response({"message": "Image deleted"}, status=status.HTTP_200_OK)

class OrderDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, order_id):
        delete_order(order_id, request.user)
        return Response({"message": "Order deleted"}, status=status.HTTP_200_OK)

class OrderStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, order_id):
        new_status = request.data.get("status")
        status = change_status(new_status, order_id)
        if not status:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        return Response({"message": "Order status updated", "status": status}, status=status.HTTP_200_OK)


class OrderCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        serializer = CompleteOrderInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = complete_order(order_id, request.user)
        return Response(
            {"message": "Order completed", "order_id": str(order.id), "status": order.status},
            status=status.HTTP_200_OK,
        )

class FormatsView(APIView):
    permission_classes = []

    def get(self, request):
        formats = PrintFormat.objects.all()
        serializer = PrintFormatSerializer(formats, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AddFormatView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if not request.user.is_staff:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        data = request.data
        try:
            name = data.get("name")
            width_mm = data.get("width_mm")
            height_mm = data.get("height_mm")
            price = data.get("price")

            if not all([name, width_mm, height_mm, price]):
                return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

            format_obj = PrintFormat.objects.create(
                name=name,
                width_mm=width_mm,
                height_mm=height_mm,
                price=price,
            )

            return Response(
                {
                    "id": str(format_obj.id),
                    "name": format_obj.name,
                    "width_mm": format_obj.width_mm,
                    "height_mm": format_obj.height_mm,
                    "price": format_obj.price,
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EditFormatView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, format_id):
        if not request.user.is_staff:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        data = request.data
        try:
            try:
                format_obj = PrintFormat.objects.get(id=format_id)
            except PrintFormat.DoesNotExist:
                return Response({"error": "Format not found"}, status=status.HTTP_404_NOT_FOUND)

            for field in ["name", "width_mm", "height_mm", "price"]:
                if field in data:
                    setattr(format_obj, field, data[field])
            format_obj.save()

            return Response(
                {
                    "id": str(format_obj.id),
                    "name": format_obj.name,
                    "width_mm": format_obj.width_mm,
                    "height_mm": format_obj.height_mm,
                    "price": format_obj.price,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DeleteFormatView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, format_id):
        try:
            try:
                format_obj = PrintFormat.objects.get(id=format_id)
            except PrintFormat.DoesNotExist:
                return Response({"error": "Format not found"}, status=status.HTTP_404_NOT_FOUND)

            format_obj.delete()
            return Response({"message": "Format deleted successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)