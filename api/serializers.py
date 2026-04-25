"""
Serializers for the Asset Management System API.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.assets.models import Asset
from apps.inventory.models import Inventory
from apps.assignments.models import Assignment
from apps.tickets.models import Ticket

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'department', 'phone']
        read_only_fields = ['id']


class AssetSerializer(serializers.ModelSerializer):
    """Serializer for Asset model with validation."""
    
    class Meta:
        model = Asset
        fields = [
            'id', 'name', 'serial_number', 'category', 'brand', 'model',
            'status', 'location', 'purchase_date', 'purchase_price',
            'warranty_expiry', 'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_serial_number(self, value):
        """Ensure serial number is unique."""
        if self.instance and self.instance.serial_number == value:
            return value
        
        if Asset.objects.filter(serial_number=value).exists():
            raise serializers.ValidationError("Asset with this serial number already exists.")
        return value

    def validate_purchase_price(self, value):
        """Validate purchase price is positive."""
        if value <= 0:
            raise serializers.ValidationError("Purchase price must be greater than zero.")
        return value


class InventorySerializer(serializers.ModelSerializer):
    """Serializer for Inventory model with computed fields."""
    is_low_stock = serializers.ReadOnlyField()
    total_value = serializers.ReadOnlyField()
    
    class Meta:
        model = Inventory
        fields = [
            'id', 'name', 'category', 'sku', 'description', 'quantity_in_stock',
            'minimum_stock_level', 'unit_price', 'supplier', 'location',
            'is_low_stock', 'total_value', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_sku(self, value):
        """Ensure SKU is unique."""
        if self.instance and self.instance.sku == value:
            return value
        
        if Inventory.objects.filter(sku=value).exists():
            raise serializers.ValidationError("Inventory item with this SKU already exists.")
        return value

    def validate_quantity_in_stock(self, value):
        """Validate quantity is not negative."""
        if value < 0:
            raise serializers.ValidationError("Quantity in stock cannot be negative.")
        return value


class AssignmentSerializer(serializers.ModelSerializer):
    """Serializer for Assignment model with nested relationships."""
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.get_full_name', read_only=True)
    
    class Meta:
        model = Assignment
        fields = [
            'id', 'asset', 'asset_name', 'assigned_to', 'assigned_to_name',
            'assigned_by', 'assigned_by_name', 'assigned_date', 'expected_return_date',
            'actual_return_date', 'status', 'notes', 'condition_on_assignment',
            'condition_on_return', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'assigned_date', 'created_at', 'updated_at']

    def validate_asset(self, value):
        """Ensure asset is available for assignment."""
        if self.instance:
            # Skip validation for updates
            return value
        
        if value.status != Asset.Status.AVAILABLE:
            raise serializers.ValidationError("Asset is not available for assignment.")
        return value

class TicketSerializer(serializers.ModelSerializer):
    """Serializer for Ticket model with nested relationships."""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'description', 'category', 'priority', 'status',
            'created_by', 'created_by_name', 'assigned_to', 'assigned_to_name',
            'asset', 'asset_name', 'resolution', 'resolved_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_title(self, value):
        """Validate title is not empty."""
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value

    def validate_description(self, value):
        """Validate description is not empty."""
        if not value.strip():
            raise serializers.ValidationError("Description cannot be empty.")
        return value


class DashboardSerializer(serializers.Serializer):
    """Serializer for dashboard statistics."""
    total_assets = serializers.IntegerField()
    available_assets = serializers.IntegerField()
    assigned_assets = serializers.IntegerField()
    inventory_items = serializers.IntegerField()
    open_tickets = serializers.IntegerField()
    assignments_today = serializers.IntegerField()