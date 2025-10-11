from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import PrintFormat
from .services import get_user_orders, create_order, delete_order_image, complete_order, get_order_detail
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
        orders = get_user_orders(request.user, search_query)

        output = OrderListOutputSerializer({
            "order_ids" : [str(order.id) for order in orders],
            "order_names": [o.name for o in orders],
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