# views/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .services import get_user_orders, create_order
from .serializers import (
    OrderSearchInputSerializer,
    OrderListOutputSerializer,
    OrderCreateInputSerializer,
    OrderOutputSerializer,
)

class OrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = OrderSearchInputSerializer(data=request.GET)
        serializer.is_valid(raise_exception=True)

        search_query = serializer.validated_data.get("search", "")
        orders = get_user_orders(request.user, search_query)

        output = OrderListOutputSerializer({
            "order_ids": [f"order-{o.id}" for o in orders],
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
