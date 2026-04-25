#!/usr/bin/env python
"""
Script to create sample data for the Asset Management System.
Run this after setting up the database to populate with test data.
"""
import os
import sys
import django
from datetime import date, timedelta
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.assets.models import Asset
from apps.inventory.models import Inventory
from apps.assignments.models import Assignment
from apps.tickets.models import Ticket

User = get_user_model()

def create_sample_data():
    """Create sample data for testing."""
    
    print("Creating sample users...")
    
    # Create admin user
    admin, created = User.objects.get_or_create(
        email='admin@example.com',
        defaults={
            'username': 'admin',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': User.Role.ADMIN,
            'department': 'IT',
        }
    )
    if created:
        admin.set_password('admin123')
        admin.save()
    
    # Create technician user
    tech, created = User.objects.get_or_create(
        email='tech@example.com',
        defaults={
            'username': 'technician',
            'first_name': 'Tech',
            'last_name': 'Support',
            'role': User.Role.TECHNICIAN,
            'department': 'IT',
        }
    )
    if created:
        tech.set_password('tech123')
        tech.save()
    
    # Create regular user
    user, created = User.objects.get_or_create(
        email='user@example.com',
        defaults={
            'username': 'user',
            'first_name': 'John',
            'last_name': 'Doe',
            'role': User.Role.USER,
            'department': 'Sales',
        }
    )
    if created:
        user.set_password('user123')
        user.save()
    
    print("Creating sample assets...")
    
    # Create sample assets
    assets_data = [
        {
            'name': 'MacBook Pro 16"',
            'serial_number': 'MBP001',
            'category': Asset.Category.LAPTOP,
            'brand': 'Apple',
            'model': 'MacBook Pro 16" M2',
            'location': 'Office Floor 1',
            'purchase_date': date.today() - timedelta(days=365),
            'purchase_price': Decimal('2499.00'),
            'warranty_expiry': date.today() + timedelta(days=365),
        },
        {
            'name': 'Dell Monitor 27"',
            'serial_number': 'MON001',
            'category': Asset.Category.MONITOR,
            'brand': 'Dell',
            'model': 'UltraSharp U2720Q',
            'location': 'Office Floor 1',
            'purchase_date': date.today() - timedelta(days=200),
            'purchase_price': Decimal('599.00'),
        },
        {
            'name': 'iPhone 14 Pro',
            'serial_number': 'IPH001',
            'category': Asset.Category.PHONE,
            'brand': 'Apple',
            'model': 'iPhone 14 Pro',
            'location': 'Office Floor 2',
            'purchase_date': date.today() - timedelta(days=100),
            'purchase_price': Decimal('999.00'),
        }
    ]
    
    for asset_data in assets_data:
        Asset.objects.get_or_create(
            serial_number=asset_data['serial_number'],
            defaults=asset_data
        )
    
    print("Creating sample inventory...")
    
    # Create sample inventory
    inventory_data = [
        {
            'name': 'USB-C Cable',
            'sku': 'CABLE001',
            'category': Inventory.Category.CABLES,
            'quantity_in_stock': 25,
            'minimum_stock_level': 10,
            'unit_price': Decimal('19.99'),
            'location': 'Storage Room A',
        },
        {
            'name': 'Wireless Mouse',
            'sku': 'MOUSE001',
            'category': Inventory.Category.ACCESSORIES,
            'quantity_in_stock': 5,
            'minimum_stock_level': 10,
            'unit_price': Decimal('49.99'),
            'location': 'Storage Room A',
        },
        {
            'name': 'Office 365 License',
            'sku': 'SOFT001',
            'category': Inventory.Category.SOFTWARE,
            'quantity_in_stock': 100,
            'minimum_stock_level': 20,
            'unit_price': Decimal('12.50'),
            'location': 'Digital',
        }
    ]
    
    for inv_data in inventory_data:
        Inventory.objects.get_or_create(
            sku=inv_data['sku'],
            defaults=inv_data
        )
    
    print("Creating sample assignments...")
    
    # Create sample assignment
    laptop = Asset.objects.filter(category=Asset.Category.LAPTOP).first()
    if laptop and laptop.status == Asset.Status.AVAILABLE:
        Assignment.objects.get_or_create(
            asset=laptop,
            assigned_to=user,
            defaults={
                'assigned_by': admin,
                'expected_return_date': date.today() + timedelta(days=365),
                'notes': 'Laptop for new employee',
                'condition_on_assignment': 'Excellent condition',
            }
        )
    
    print("Creating sample tickets...")
    
    # Create sample tickets
    tickets_data = [
        {
            'title': 'Laptop screen flickering',
            'description': 'The laptop screen flickers intermittently, especially when opening heavy applications.',
            'category': Ticket.Category.HARDWARE_ISSUE,
            'priority': Ticket.Priority.HIGH,
            'created_by': user,
            'asset': laptop,
        },
        {
            'title': 'Request for additional monitor',
            'description': 'Need an additional monitor for improved productivity.',
            'category': Ticket.Category.ACCESS_REQUEST,
            'priority': Ticket.Priority.MEDIUM,
            'created_by': user,
        }
    ]
    
    for ticket_data in tickets_data:
        Ticket.objects.get_or_create(
            title=ticket_data['title'],
            created_by=ticket_data['created_by'],
            defaults=ticket_data
        )
    
    print("Sample data created successfully!")
    print("\nLogin credentials:")
    print("Admin: admin@example.com / admin123")
    print("Technician: tech@example.com / tech123") 
    print("User: user@example.com / user123")

if __name__ == '__main__':
    create_sample_data()