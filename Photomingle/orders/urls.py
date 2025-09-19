# urls.py
from django.urls import path
from .views import OrderListView, OrderCreateView, OrderDetailView, OrderDeleteImageView, OrderCompleteView

urlpatterns = [
    path("orders/", OrderListView.as_view(), name="orders-list"),
    path("orders/create/", OrderCreateView.as_view(), name="orders-create"),
    path("orders/<uuid:order_id>/", OrderDetailView.as_view(), name="order-detail"),
    path("orders/<uuid:order_id>/delete-image/", OrderDeleteImageView.as_view(), name="order-delete-image"),
    path("orders/<uuid:order_id>/complete/", OrderCompleteView.as_view(), name="order-complete"),
]
