from django.urls import path
from .views import MyOrdersView, OrderDetailView, OrderInviteJoinView, AddImage

urlpatterns = [
    path('orders/', MyOrdersView.as_view(), name='orders-list-create'),
    path('orders/<str:order_id>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/invite/<str:shortcut_url>/', OrderInviteJoinView.as_view(), name='order-invite-join'),
    path('orders/<str:order_id>/addImage/', AddImage.as_view(), name='order-detail'),
]

