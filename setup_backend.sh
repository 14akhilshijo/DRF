#!/bin/bash
# ============================================================
# Run this script ON YOUR EC2 INSTANCE after SSH-ing in
# ============================================================

echo "=== Setting up Asset Management Backend on EC2 ==="

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip libpq-dev nginx git

echo "=== Installing application ==="

# Create app directory
sudo mkdir -p /var/www/asset-management
sudo chown ubuntu:ubuntu /var/www/asset-management

# Copy uploaded files (run after scp)
cp -r ~/app/* /var/www/asset-management/ 2>/dev/null || true

cd /var/www/asset-management

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install production dependencies
pip install Django==5.0.0 \
    djangorestframework==3.14.0 \
    djangorestframework-simplejwt==5.3.0 \
    django-filter==23.5 \
    django-cors-headers==4.3.1 \
    psycopg2-binary==2.9.9 \
    python-decouple==3.8 \
    dj-database-url==2.1.0 \
    gunicorn==21.2.0 \
    whitenoise==6.6.0

# Copy production .env
cp .env.production .env

# Run Django setup
export DJANGO_SETTINGS_MODULE=config.settings_production
python manage.py migrate --no-input
python manage.py collectstatic --no-input
python create_sample_data.py

echo "=== Setting up Gunicorn service ==="

sudo tee /etc/systemd/system/gunicorn.service > /dev/null << 'EOF'
[Unit]
Description=Gunicorn for Asset Management System
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/var/www/asset-management
Environment="DJANGO_SETTINGS_MODULE=config.settings_production"
ExecStart=/var/www/asset-management/venv/bin/gunicorn config.wsgi:application --bind 127.0.0.1:8000 --workers 3 --timeout 30
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable gunicorn
sudo systemctl start gunicorn

echo "=== Setting up Nginx ==="

EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

sudo tee /etc/nginx/sites-available/asset-management > /dev/null << NGINX
server {
    listen 80;
    server_name $EC2_IP;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /static/ {
        alias /var/www/asset-management/staticfiles/;
        expires 30d;
    }

    location / {
        return 200 '{"message":"Asset Management API","status":"running","api":"/api/"}';
        add_header Content-Type application/json;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/asset-management /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo ""
echo "=== SETUP COMPLETE ==="
echo "Backend API: http://$EC2_IP/api/"
echo "Admin Panel: http://$EC2_IP/admin/"
echo ""
echo "Test with:"
echo "  curl http://$EC2_IP/api/"