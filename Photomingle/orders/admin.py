from django.contrib import admin
from .models import Order, Image, PrintFormat

admin.site.register(Order)
admin.site.register(Image)
admin.site.register(PrintFormat)