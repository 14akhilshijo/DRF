"""
Filters for the Asset Management System API.
"""
import django_filters
from apps.assets.models import Asset
from apps.inventory.models import Inventory
from apps.assignments.models import Assignment
from apps.tickets.models import Ticket


class AssetFilter(django_filters.FilterSet):
    """Filter for Asset model with search and filtering capabilities."""
    
    name = django_filters.CharFilter(lookup_expr='icontains')
    serial_number = django_filters.CharFilter(lookup_expr='icontains')
    category = django_filters.ChoiceFilter(choices=Asset.Category.choices)
    status = django_filters.ChoiceFilter(choices=Asset.Status.choices)
    location = django_filters.CharFilter(lookup_expr='icontains')
    brand = django_filters.CharFilter(lookup_expr='icontains')
    purchase_date_from = django_filters.DateFilter(field_name='purchase_date', lookup_expr='gte')
    purchase_date_to = django_filters.DateFilter(field_name='purchase_date', lookup_expr='lte')
    
    class Meta:
        model = Asset
        fields = ['name', 'serial_number', 'category', 'status', 'location', 'brand']


class InventoryFilter(django_filters.FilterSet):
    """Filter for Inventory model."""
    
    name = django_filters.CharFilter(lookup_expr='icontains')
    category = django_filters.ChoiceFilter(choices=Inventory.Category.choices)
    sku = django_filters.CharFilter(lookup_expr='icontains')
    location = django_filters.CharFilter(lookup_expr='icontains')
    low_stock = django_filters.BooleanFilter(method='filter_low_stock')
    
    class Meta:
        model = Inventory
        fields = ['name', 'category', 'sku', 'location']
    
    def filter_low_stock(self, queryset, name, value):
        """Filter items with low stock."""
        if value:
            from django.db import models
            return queryset.filter(quantity_in_stock__lte=models.F('minimum_stock_level'))
        return queryset


class AssignmentFilter(django_filters.FilterSet):
    """Filter for Assignment model."""
    
    status = django_filters.ChoiceFilter(choices=Assignment.Status.choices)
    assigned_date_from = django_filters.DateTimeFilter(field_name='assigned_date', lookup_expr='gte')
    assigned_date_to = django_filters.DateTimeFilter(field_name='assigned_date', lookup_expr='lte')
    
    class Meta:
        model = Assignment
        fields = ['status', 'asset', 'assigned_to']


class TicketFilter(django_filters.FilterSet):
    """Filter for Ticket model."""
    
    title = django_filters.CharFilter(lookup_expr='icontains')
    category = django_filters.ChoiceFilter(choices=Ticket.Category.choices)
    priority = django_filters.ChoiceFilter(choices=Ticket.Priority.choices)
    status = django_filters.ChoiceFilter(choices=Ticket.Status.choices)
    created_date_from = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_date_to = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = Ticket
        fields = ['title', 'category', 'priority', 'status', 'created_by', 'assigned_to', 'asset']