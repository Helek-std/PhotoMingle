from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
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

    if not settings.DEBUG:
        otp_email = EmailSender(normalized_email)
        if not otp_email.send_mail():
            return user, "Введите код из письма"
        return None, "Ошибка сервера при отправке кода"

    return user, "Введите код из письма"


def login_user(email: str, password: str):
    user = authenticate(email=email, password=password)
    if not user:
        return None, "Неверные учетные данные"

    if not settings.DEBUG:
        otp_email = EmailSender(email.lower())
        if not otp_email.send_mail():
            return user, "Введите код из письма"
        return None, "Ошибка сервера при отправке кода"

    return user, "Введите код из письма"


def logout_user(refresh_token: str):
    from rest_framework_simplejwt.tokens import RefreshToken
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return True, "Logout successful"
    except Exception:
        return False, "Invalid token"


def verify_two_factor(email: str, code: str):
    if not settings.DEBUG:
        new_otp = EmailSender(email.lower())
        if not new_otp.verify(code):
            return None, "Неверный код или код истек"

    try:
        user = CustomUser.objects.get(email=email)
    except CustomUser.DoesNotExist:
        return None, "Пользователь не найден"

    return user, None

def get_user_info(user_id):
    return get_object_or_404(CustomUser, id=user_id)
