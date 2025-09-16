from django.urls import path
from .views import LoginView, RegisterView, TwoFactorAuthView, LogoutView

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("register/", RegisterView.as_view(), name="register"),
    path("2fa/", TwoFactorAuthView.as_view(), name="2fa"),
]
