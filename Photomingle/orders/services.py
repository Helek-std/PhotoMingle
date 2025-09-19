# services/order_service.py
import hashlib, uuid
from django.db.models import Q
from django.contrib.postgres.search import TrigramSimilarity
from .models import Order, OrderStatus


def generate_shortcut_url():
    raw_uuid = uuid.uuid4().hex
    hash_object = hashlib.md5(raw_uuid.encode())
    return hash_object.hexdigest()[:8]


def get_user_orders(user, search_query=""):
    orders = Order.objects.filter(
        Q(owner=user) | Q(guest_users__in=[user])
    ).distinct()

    if search_query:
        orders = (
            orders.annotate(similarity=TrigramSimilarity("name", search_query))
            .filter(similarity__gt=0.2)
            .order_by("-similarity")
        )

    return orders


def create_order(user, name):
    return Order.objects.create(
        name=name,
        owner=user,
        shortcut_url=generate_shortcut_url(),
        status=OrderStatus.IN_CREATION
    )
