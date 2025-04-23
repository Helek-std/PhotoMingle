from django.db import models
from django.conf import settings
import uuid

from rest_framework.fields import empty


class OrderStatus(models.TextChoices):
    IN_CREATION = 'in_creation', 'In Creation'
    IN_WORK = 'in_work', 'In Work'
    READY = 'ready', 'Ready'

class Order(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_orders')
    guest_users = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='guest_orders', blank=True)
    shortcut_url = models.CharField(max_length=255, unique=True, blank=True)
    status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.IN_CREATION)

    def _get_status_display(self):
        return str(self.status)

    def __str__(self):
        return f"{self.name} ({self._get_status_display()})"

def order_image_upload_path(instance, filename):
    return f"{instance.order.id}/images/{filename}"

def order_preview_upload_path(instance, filename):
    return f"{instance.order.id}/previews/{filename}"

class PrintFormat(models.Model):
    name = models.CharField(max_length=100)
    width_mm = models.PositiveIntegerField()
    height_mm = models.PositiveIntegerField()
    price = models.IntegerField()

class Image(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.ImageField(upload_to=order_image_upload_path)
    preview = models.ImageField(upload_to=order_preview_upload_path, null=True, blank=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="images")
    format = models.ForeignKey(PrintFormat,on_delete=models.CASCADE,null=True)

    def __str__(self):
        return f"Image {self.id} for Order {self.order.name}"


