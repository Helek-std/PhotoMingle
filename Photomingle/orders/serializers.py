# serializers/serializers.py
from django.db.models import Sum
from rest_framework import serializers
from .models import Order, Image, PrintFormat


class OrderSearchInputSerializer(serializers.Serializer):
    search = serializers.CharField(required=False, allow_blank=True)
    admin_request = serializers.BooleanField(required=False)


class OrderListOutputSerializer(serializers.Serializer):
    order_ids = serializers.ListField(child=serializers.CharField())
    order_names = serializers.ListField(child=serializers.CharField())
    order_users = serializers.ListField(child=serializers.CharField())
    order_status = serializers.ListField(child=serializers.CharField())


class OrderCreateInputSerializer(serializers.Serializer):
    name = serializers.CharField(required=True, max_length=255)


class OrderOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["id", "name", "shortcut_url", "status"]


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ["id", "file", "preview"]


class OrderDetailSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "name",
            "shortcut_url",
            "status",
            "images",
            "total_price",
        ]

    def get_total_price(self, obj):
        return obj.images.aggregate(
            total=Sum('format__price')
        )['total'] or 0


class DeleteImageInputSerializer(serializers.Serializer):
    image_id = serializers.UUIDField()


class CompleteOrderInputSerializer(serializers.Serializer):
    confirm = serializers.BooleanField(default=True)


class PrintFormatSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrintFormat
        fields = ['id', 'name', 'width_mm', 'height_mm', 'price']
