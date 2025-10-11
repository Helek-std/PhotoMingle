# urls.py
from django.urls import path
from .views import OrderListView, OrderCreateView, OrderDetailView, OrderDeleteImageView, OrderCompleteView, \
    FormatsView, OrderDeleteView, OrderStatusUpdateView

urlpatterns = [
    path("orders/", OrderListView.as_view(), name="orders-list"),
    path("orders/create/", OrderCreateView.as_view(), name="orders-create"),
    path("orders/<uuid:order_id>/", OrderDetailView.as_view(), name="order-detail"),
    path("orders/<uuid:order_id>/delete-image/", OrderDeleteImageView.as_view(), name="order-delete-image"),
    path("orders/delete/<uuid:order_id>/", OrderDeleteView.as_view(), name="order-delete"),
    path("orders/<uuid:order_id>/complete/", OrderCompleteView.as_view(), name="order-complete"),
    path("orders/update_status/<uuid:order_id>/", OrderStatusUpdateView.as_view(), name="order-update-status"),
    path("formats/", FormatsView.as_view(), name="formats")
]
