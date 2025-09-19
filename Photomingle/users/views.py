# users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.middleware import csrf
from django.conf import settings

from .serializers import (
    RegisterInputSerializer, RegisterOutputSerializer,
    LoginInputSerializer, LoginOutputSerializer,
    LogoutOutputSerializer, TwoFactorInputSerializer,
    TokenOutputSerializer
)
from .services import register_user, login_user, logout_user, verify_two_factor
from .authenticate import CustomAuthentication


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

        return Response({"message": message}, status=status.HTTP_202_ACCEPTED)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user, message = login_user(
            serializer.validated_data["email"],
            serializer.validated_data["password"]
        )
        if not user and "Неверные" in message:
            return Response({"error": message}, status=status.HTTP_401_UNAUTHORIZED)
        if not user:
            return Response({"message": message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": message}, status=status.HTTP_202_ACCEPTED)


class LogoutView(APIView):
    authentication_classes = [CustomAuthentication]

    def get(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({"error": "No refresh token provided"}, status=status.HTTP_400_BAD_REQUEST)

        success, message = logout_user(refresh_token)
        if not success:
            return Response({"error": message}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": message}, status=status.HTTP_205_RESET_CONTENT)


class TwoFactorAuthView(APIView):
    def post(self, request):
        serializer = TwoFactorInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        tokens, error = verify_two_factor(
            serializer.validated_data["email"],
            serializer.validated_data["code"]
        )
        if error:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

        response = Response(tokens, status=status.HTTP_200_OK)

        response.set_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE"],
            value=tokens["access"],
            expires=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
            secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
            httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        )
        csrf.get_token(request)

        return response
