"""
Inventory models for the Asset Management System.
"""
from django.db import models
from apps.core.models import TimeStampedModel


class Inventory(TimeStampedModel):
    """
    Inventory model for tracking consumable items and supplies.
    """
    class Category(models.TextChoices):
        ACCESSORIES = 'accessories', 'Accessories'
        CABLES = 'cables', 'Cables'
        CONSUMABLES = 'consumables', 'Consumables'
        SOFTWARE = 'software', 'Software'
        PARTS = 'parts', 'Parts'
        OTHER = 'other', 'Other'

    name = models.CharField(max_length=200)
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER
    )
    sku = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    quantity_in_stock = models.PositiveIntegerField(default=0)
    minimum_stock_level = models.PositiveIntegerField(default=5)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    supplier = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=200)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Inventory'

    def __str__(self):
        return f"{self.name} (Stock: {self.quantity_in_stock})"

    @property
    def is_low_stock(self):
        return self.quantity_in_stock <= self.minimum_stock_level

    @property
    def total_value(self):
        return self.quantity_in_stock * self.unit_price