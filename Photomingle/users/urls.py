from django.urls import path
from .views import RegisterView, LoginView, TwoFactorAuthView, MyInfo
from django.contrib.auth.views import LogoutView

urlpatterns = [
    path("users/register/", RegisterView.as_view(), name="register"),
    path("users/login/", LoginView.as_view(), name="login"),
    path("users/logout/", LogoutView.as_view(), name="logout"),
    path("users/2fa/", TwoFactorAuthView.as_view(), name="two-factor"),
    path("users/myinfo/", MyInfo.as_view(), name="two-factor"),
]
