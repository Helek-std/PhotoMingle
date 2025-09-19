# urls.py
from django.urls import path
from .views import OrderListView, OrderCreateView

urlpatterns = [
    path("orders/", OrderListView.as_view(), name="orders-list"),
    path("orders/create/", OrderCreateView.as_view(), name="orders-create"),
]
