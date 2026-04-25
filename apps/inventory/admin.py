from django.contrib import admin
from .models import Inventory


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'category', 'quantity_in_stock', 'minimum_stock_level', 'is_low_stock')
    list_filter = ('category', 'location')
    search_fields = ('name', 'sku', 'supplier')
    ordering = ('name',)
    
    def is_low_stock(self, obj):
        return obj.is_low_stock
    is_low_stock.boolean = True
    is_low_stock.short_description = 'Low Stock'