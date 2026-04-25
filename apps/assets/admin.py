from django.contrib import admin
from .models import Asset


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('name', 'serial_number', 'category', 'status', 'location', 'created_at')
    list_filter = ('status', 'category', 'location')
    search_fields = ('name', 'serial_number', 'brand', 'model')
    ordering = ('-created_at',)