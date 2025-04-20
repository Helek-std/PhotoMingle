from rest_framework import serializers
from .models import Order, Image


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['id', 'file', 'preview']

class OrderSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, read_only=True)
    owner = serializers.StringRelatedField()
    guest_users = serializers.StringRelatedField(many=True)

    class Meta:
        model = Order
        fields = ['id', 'name', 'owner', 'guest_users', 'status', 'shortcut_url', 'images']