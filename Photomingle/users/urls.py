from django.urls import path
from .views import RegisterView, LoginView, TwoFactorAuthView, MyInfo, LogoutView, UsersListView, AddUserView, \
    EditUserView, DeleteUserView

urlpatterns = [
    path("users/register/", RegisterView.as_view(), name="register"),
    path("users/login/", LoginView.as_view(), name="login"),
    path("users/logout/", LogoutView.as_view(), name="logout"),
    path("users/2fa/", TwoFactorAuthView.as_view(), name="two-factor"),
    path("users/myinfo/", MyInfo.as_view(), name="my-info"),
    path("users/", UsersListView.as_view(), name="user-list"),
    path("users/add/", AddUserView.as_view(), name="add-user"),
    path("users/edit/<uuid:user_id>/", EditUserView.as_view(), name="edit-user"),
    path("users/delete/<uuid:user_id>/", DeleteUserView.as_view(), name="delete-user"),
]
