#!/bin/bash
# AWS EC2 Deployment Script for Asset Management System

echo "=== Starting Deployment ==="

# Pull latest code
git pull origin main

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
pip install -r requirements_production.txt

# Set production settings
export DJANGO_SETTINGS_MODULE=config.settings_production

# Run migrations
python manage.py migrate --no-input

# Collect static files
python manage.py collectstatic --no-input

# Restart Gunicorn
sudo systemctl restart gunicorn

# Restart Nginx
sudo systemctl restart nginx

echo "=== Deployment Complete ==="