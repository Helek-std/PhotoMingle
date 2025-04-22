from django.urls import path
from .views import MyOrdersView, OrderDetailView, OrderInviteJoinView

urlpatterns = [
    path('orders/', MyOrdersView.as_view(), name='orders-list-create'),  # Список заказов и создание нового
    path('orders/<str:order_id>/', OrderDetailView.as_view(), name='order-detail'),  # Детали заказа
    path('api/orders/invite/<str:invite_token>/', OrderInviteJoinView.as_view(), name='order-invite-join'),
]

