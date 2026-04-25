#!/bin/bash
# EC2 Initial Setup Script - Run this ONCE on a fresh Ubuntu 22.04 EC2 instance

echo "=== Setting up EC2 for Asset Management System ==="

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Install Nginx
sudo apt install -y nginx

# Install PostgreSQL client (for psycopg2)
sudo apt install -y libpq-dev

# Install Git
sudo apt install -y git

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Create app directory
sudo mkdir -p /var/www/asset-management
sudo chown ubuntu:ubuntu /var/www/asset-management

# Clone your repository (replace with your actual repo URL)
cd /var/www/asset-management
git clone https://github.com/YOUR_USERNAME/asset-management.git .

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements_production.txt

# Create .env file
cat > .env << 'EOF'
DEBUG=False
SECRET_KEY=REPLACE_WITH_STRONG_SECRET_KEY
DATABASE_URL=postgresql://DB_USER:DB_PASSWORD@RDS_ENDPOINT:5432/DB_NAME
DB_NAME=asset_management
DB_USER=admin
DB_PASSWORD=REPLACE_WITH_DB_PASSWORD
DB_HOST=YOUR_RDS_ENDPOINT.rds.amazonaws.com
DB_PORT=5432
ALLOWED_HOSTS=YOUR_EC2_IP,your-domain.com,www.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY
AWS_STORAGE_BUCKET_NAME=your-asset-management-bucket
AWS_S3_REGION_NAME=us-east-1
EOF

echo "Edit .env file with your actual values before continuing!"
echo "Run: nano .env"

# Setup Gunicorn systemd service
sudo tee /etc/systemd/system/gunicorn.service > /dev/null << 'EOF'
[Unit]
Description=Gunicorn daemon for Asset Management System
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/var/www/asset-management
Environment="DJANGO_SETTINGS_MODULE=config.settings_production"
ExecStart=/var/www/asset-management/venv/bin/gunicorn \
    --config gunicorn.conf.py \
    config.wsgi:application

[Install]
WantedBy=multi-user.target
EOF

# Copy Nginx config
sudo cp nginx.conf /etc/nginx/sites-available/asset-management
sudo ln -s /etc/nginx/sites-available/asset-management /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Enable and start services
sudo systemctl daemon-reload
sudo systemctl enable gunicorn
sudo systemctl start gunicorn
sudo systemctl restart nginx

echo "=== EC2 Setup Complete ==="
echo "Next: Configure your .env file and run migrations"