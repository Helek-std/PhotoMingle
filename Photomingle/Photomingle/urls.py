from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("users.urls")),  # Должно быть корректно
    path("", include("users.urls")),  # Загружаем React SPA
]
