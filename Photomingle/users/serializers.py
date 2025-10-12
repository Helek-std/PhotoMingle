from rest_framework import serializers

from .models import CustomUser

class RegisterInputSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class RegisterOutputSerializer(serializers.Serializer):
    message = serializers.CharField()


class LoginInputSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class LogoutInputSerializer(serializers.Serializer):
    all = serializers.BooleanField(default=False)

class LogoutOutputSerializer(serializers.Serializer):
    message = serializers.CharField()


class TwoFactorInputSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField()

class TokenOutputSerializer(serializers.Serializer):
    access_token = serializers.CharField()
    refresh_token = serializers.CharField()


class MyInfoOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "email", "role", "avatar"]

