#!/usr/bin/env python
"""
Setup script for Asset Management System.
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

def setup_project():
    """Setup the Django project."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    
    try:
        django.setup()
        
        # Create migrations
        print("Creating migrations...")
        execute_from_command_line(['manage.py', 'makemigrations'])
        
        # Apply migrations
        print("Applying migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        
        # Create superuser (optional)
        print("\nSetup completed successfully!")
        print("To create a superuser, run: python manage.py createsuperuser")
        print("To start the development server, run: python manage.py runserver")
        
    except Exception as e:
        print(f"Error during setup: {e}")
        sys.exit(1)

if __name__ == '__main__':
    setup_project()