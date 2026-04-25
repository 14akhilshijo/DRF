"""
Asset models for the Asset Management System.
"""
from django.db import models
from apps.core.models import TimeStampedModel


class Asset(TimeStampedModel):
    """
    Asset model representing physical or digital assets.
    """
    class Status(models.TextChoices):
        AVAILABLE = 'available', 'Available'
        ASSIGNED = 'assigned', 'Assigned'
        MAINTENANCE = 'maintenance', 'Under Maintenance'
        RETIRED = 'retired', 'Retired'

    class Category(models.TextChoices):
        LAPTOP = 'laptop', 'Laptop'
        DESKTOP = 'desktop', 'Desktop'
        MONITOR = 'monitor', 'Monitor'
        PHONE = 'phone', 'Phone'
        TABLET = 'tablet', 'Tablet'
        PRINTER = 'printer', 'Printer'
        OTHER = 'other', 'Other'

    name = models.CharField(max_length=200)
    serial_number = models.CharField(max_length=100, unique=True)
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER
    )
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.AVAILABLE
    )
    location = models.CharField(max_length=200)
    purchase_date = models.DateField()
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    warranty_expiry = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.serial_number})"