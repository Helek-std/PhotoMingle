# serializers/serializers.py
from rest_framework import serializers
from .models import Order, Image


class OrderSearchInputSerializer(serializers.Serializer):
    search = serializers.CharField(required=False, allow_blank=True)


class OrderListOutputSerializer(serializers.Serializer):
    order_ids = serializers.ListField(child=serializers.CharField())
    order_names = serializers.ListField(child=serializers.CharField())


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

    class Meta:
        model = Order
        fields = [
            "id",
            "name",
            "shortcut_url",
            "status",
            "images",
        ]


class DeleteImageInputSerializer(serializers.Serializer):
    image_id = serializers.UUIDField()


class CompleteOrderInputSerializer(serializers.Serializer):
    confirm = serializers.BooleanField(default=True)
