from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email', 'role', 'is_active', 'is_staff', 'is_admin')  # Поля в списке пользователей
    list_filter = ('role', 'is_active', 'is_staff', 'is_admin')  # Фильтры справа
    fieldsets = (
        (None, {'fields': ('email', 'password_hash', 'role', 'active_sessions')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_admin', 'is_superuser')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'password_hash', 'role', 'is_active', 'is_staff', 'is_admin'),
        }),
    )
    search_fields = ('email',)
    ordering = ('email',)


admin.site.register(CustomUser, CustomUserAdmin)
