import random

from django.core.cache import cache
from django.http import JsonResponse
from django.shortcuts import render
from django.views import View
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CustomUser, CustomUserManager




class RegisterView(APIView):
    def get(self, request):
        return render(request, "index.html")

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        normalized_email = CustomUserManager.normalize_email(email)
        existing_user = CustomUser.objects.filter(email=normalized_email)
        if not  existing_user:
            user = CustomUser.objects.create_user(email=email,
                                           password=password)
            user.save()
            user = authenticate(email=email, password=password)
            if user is not None:
                refresh = RefreshToken.for_user(user)
                refresh['email'] = user.email
                return Response({
                    "access_token": str(refresh.access_token),
                    "refresh_token": str(refresh),
                })
        return Response({"error": "User with this email already exists"}, status=status.HTTP_409_CONFLICT)

class LoginView(APIView):
    def get(self, request):
        return render(request, "index.html")

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(email=email, password=password)
        if user is not None:
            code = str(random.randint(100000, 999999))

            cache.set(f"2fa_code_{email}", code, timeout=300)

            print(code)
            # send_mail(
            #     "Ваш код подтверждения",
            #     f"Ваш код для входа: {code}",
            #     MAIL_2FA,
            #     [user.email],
            #     fail_silently=False,
            # )

            return Response({"message": "Введите код из письма"}, status=status.HTTP_202_ACCEPTED)

        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            refresh_token = request.COOKIES.get("refresh_token")
            if not refresh_token:
                return Response({"error": "No refresh token provided"}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Logout successful"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

class MyOrdersView(APIView):
    authentication_classes = [JWTAuthentication]
    def get(self, request):
        auth_header = request.headers.get('Authorization')
        if auth_header:
            token_type, token = auth_header.split()

        # Если нет токена, возвращаем ошибку
        if not auth_header or token_type != "Bearer":
            return Response({"detail": "Token is missing or invalid"}, status=401)

        user_email = request.user.email  # Получаем email пользователя
        return Response({"email": user_email})

class TwoFactorAuthView(APIView):
    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")

        if not email or not code:
            return JsonResponse({"error": "Email и код обязательны"}, status=400)

        stored_code = cache.get(f"2fa_code_{email}")
        if not stored_code or stored_code != code:
            return JsonResponse({"error": "Неверный код или код истек"}, status=400)

        cache.delete(f"2fa_code_{email}")

        try:
            user = CustomUser.objects.get(email=email)
        except:
            return JsonResponse({"error": "Пользователь не найден"}, status=400)

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return JsonResponse({
            "access_token": access_token,
            "refresh_token": str(refresh),
        }, status=200)

    def get(self, request):
        return render(request, "index.html")
