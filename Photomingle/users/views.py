from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.views import APIView

from .otp import EmailSender
from .models import CustomUser
from django.conf import settings

class RegisterView(APIView):
    def get(self, request):
        return render(request, "index.html")

    def post(self, request):
        email: str = request.data.get("email")
        password: str = request.data.get("password")

        normalized_email = email.lower()
        existing_user = CustomUser.objects.filter(email=normalized_email).exists()
        if existing_user:
            return Response(
                {"error": "Пользователь с таким email уже существует"},
                status=status.HTTP_409_CONFLICT,
            )

        user = CustomUser.objects.create_user(email=email, password=password)
        user.save()
        if not settings.DEBUG:
            otp_email = EmailSender(normalized_email)
            if not otp_email.send_mail():
                return Response(
                    {"message": "Введите код из письма"}, status=status.HTTP_202_ACCEPTED
                )
            else:
                return Response(
                     {"message": "Server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        return Response(
            {"message": "Введите код из письма"}, status=status.HTTP_202_ACCEPTED
        )


class LoginView(APIView):
    def get(self, request):
        return render(request, "index.html")

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(email=email, password=password)
        if user is not None:
            if not settings.DEBUG:
                otp_email = EmailSender(email.lower())
                if not otp_email.send_mail():
                    return Response(
                        {"message": "Enter code from email"}, status=status.HTTP_202_ACCEPTED
                    )
                else:
                    return Response(
                         {"message": "Server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            else:
                return Response(
                    {"message": "Enter code from email"}, status=status.HTTP_202_ACCEPTED
                )
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )


class LogoutView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            refresh_token = request.COOKIES.get("refresh_token")
            if not refresh_token:
                return Response(
                    {"error": "No refresh token provided"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {"message": "Logout successful"}, status=status.HTTP_205_RESET_CONTENT
            )
        except Exception:
            return Response(
                {"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST
            )


class TwoFactorAuthView(APIView):
    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")

        if not email or not code:
            return JsonResponse({"error": "Email и код обязательны"}, status=400)


        if not settings.DEBUG:
            new_otp = EmailSender(email.lower())
            if not new_otp.verify(code):
                return JsonResponse({"error": "Неверный код или код истек"}, status=400)

        try:
            user = CustomUser.objects.get(email=email)
        except:
            return JsonResponse({"error": "Пользователь не найден"}, status=400)

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return JsonResponse(
            {
                "access_token": access_token,
                "refresh_token": str(refresh),
            },
            status=200,
        )

    def get(self, request):
        return render(request, "index.html")
