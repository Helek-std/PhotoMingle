from django.contrib.auth import authenticate, logout, login
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from user_sessions.models import Session

from .models import CustomUser
from .otp import EmailSender


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


def register_user(email: str, password: str):
    normalized_email = email.lower()
    if CustomUser.objects.filter(email=normalized_email).exists():
        return None, "Пользователь с таким email уже существует"

    user = CustomUser.objects.create_user(email=normalized_email, password=password)
    user.save()
    return user, ''


def login_user(email: str, password: str, request):
    user = authenticate(email=email, password=password)
    if not user:
        return None, "Неверные учетные данные"
    login(request, user)
    return user, ''


def logout_user(refresh_token: str):
    from rest_framework_simplejwt.tokens import RefreshToken
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return True, "Logout successful"
    except Exception:
        return False, "Invalid token"


def verify_two_factor(request, email: str, code: str):
    if not settings.DEBUG:
        new_otp = EmailSender(email.lower())
        if not new_otp.verify(code):
            return None, "Неверный код или код истек"

    try:
        user = CustomUser.objects.get(email=email)
    except CustomUser.DoesNotExist:
        return None, "Пользователь не найден"

    login(request, user)

    return user, None



def get_user_info(user_id):
    return get_object_or_404(CustomUser, id=user_id)

def logout_current_session(request):
    logout(request)
    return True


def logout_all_sessions(user):
    Session.objects.filter(user=user).delete()
    return True