"""
Assignment models for the Asset Management System.
"""
from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel
from apps.assets.models import Asset


class Assignment(TimeStampedModel):
    """
    Assignment model for tracking asset assignments to users.
    """
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        RETURNED = 'returned', 'Returned'
        OVERDUE = 'overdue', 'Overdue'

    asset = models.ForeignKey(
        Asset,
        on_delete=models.CASCADE,
        related_name='assignments'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='asset_assignments'
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assignments_made'
    )
    assigned_date = models.DateTimeField(auto_now_add=True)
    expected_return_date = models.DateField(null=True, blank=True)
    actual_return_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    notes = models.TextField(blank=True)
    condition_on_assignment = models.TextField(blank=True)
    condition_on_return = models.TextField(blank=True)

    class Meta:
        ordering = ['-assigned_date']

    def __str__(self):
        return f"{self.asset.name} assigned to {self.assigned_to.get_full_name()}"

    def save(self, *args, **kwargs):
        # Update asset status when assignment is created or updated
        if self.status == self.Status.ACTIVE:
            self.asset.status = Asset.Status.ASSIGNED
        elif self.status == self.Status.RETURNED:
            self.asset.status = Asset.Status.AVAILABLE
        
        self.asset.save()
        super().save(*args, **kwargs)