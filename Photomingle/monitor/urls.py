from django.urls import path
from . import views
from .views import MonitorView

urlpatterns = [
    path('status/', MonitorView.as_view(), name='system_status'),
]