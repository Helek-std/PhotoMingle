from django.urls import path
from .views import MyOrdersView, OrderDetailView, AddImage

urlpatterns = [
    path('orders/', MyOrdersView.as_view(), name='orders-list-create'),  # Список заказов и создание нового
    path('orders/<str:order_id>/', OrderDetailView.as_view(), name='order-detail'),  # Детали заказа
    path('orders/<str:order_id>/addImage/', AddImage.as_view(), name='order-detail'),  # Детали заказа
]

