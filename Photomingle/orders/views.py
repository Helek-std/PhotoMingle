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