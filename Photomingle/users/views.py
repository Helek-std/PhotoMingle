# users/views.py
from django.contrib.auth import logout, login
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.middleware import csrf
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication

from .serializers import (
    RegisterInputSerializer,
    LoginInputSerializer,
    TwoFactorInputSerializer,
    MyInfoOutputSerializer
)
from .services import register_user, login_user, logout_user, verify_two_factor, get_user_info


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user, message = register_user(
            serializer.validated_data["email"],
            serializer.validated_data["password"]
        )
        if not user and "существует" in message:
            return Response({"error": message}, status=status.HTTP_409_CONFLICT)
        if not user:
            return Response({"message": message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "2FA required", "user_id": str(user.id)}, status=status.HTTP_202_ACCEPTED)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user, message = login_user(
            serializer.validated_data["email"],
            serializer.validated_data["password"]
        )
        if not user:
            return Response({"error": message}, status=status.HTTP_401_UNAUTHORIZED)

        return Response({"message": "2FA required", "email": str(user.email)}, status=status.HTTP_200_OK)

class TwoFactorAuthView(APIView):
    def post(self, request):
        serializer = TwoFactorInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user, error = verify_two_factor(
            serializer.validated_data["email"],
            serializer.validated_data["code"]
        )
        if error:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

        login(request, user)

        return Response(status=status.HTTP_200_OK)

class MyInfo(APIView):
    def get(self, request):
        user_info = get_user_info(request.user.id)
        output =  MyInfoOutputSerializer(user_info)
        return Response(output.data, status=status.HTTP_200_OK)