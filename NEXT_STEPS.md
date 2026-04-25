# Next Steps After Running aws_deploy.ps1

## After the script completes, do these steps:

---

## Step 1 — Get RDS Endpoint (5 min after script)

Go to: https://console.aws.amazon.com/rds/
- Click your database: `asset-management-db`
- Copy the **Endpoint** (looks like):
  `asset-management-db.xxxx.us-east-1.rds.amazonaws.com`

---

## Step 2 — SSH Into EC2

```bash
# Windows PowerShell
ssh -i "asset-management-key.pem" ubuntu@YOUR_EC2_IP
```

If permission error:
```powershell
icacls "asset-management-key.pem" /inheritance:r /grant:r "$($env:USERNAME):R"
```

---

## Step 3 — Upload Your Project to EC2

On your LOCAL machine (new PowerShell window):
```powershell
# Upload entire project to EC2
scp -i "asset-management-key.pem" -r . ubuntu@YOUR_EC2_IP:/var/www/asset-management/
```

---

## Step 4 — Setup Django on EC2

SSH into EC2 and run:
```bash
cd /var/www/asset-management

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements_production.txt

# Create .env file
nano .env
```

Paste this into .env (replace values):
```env
DEBUG=False
SECRET_KEY=your-very-long-random-secret-key-here-make-it-50-chars
DATABASE_URL=postgresql://admin:YOUR_DB_PASSWORD@YOUR_RDS_ENDPOINT:5432/asset_management
DB_NAME=asset_management
DB_USER=admin
DB_PASSWORD=YOUR_DB_PASSWORD_FROM_DEPLOYMENT_INFO.txt
DB_HOST=YOUR_RDS_ENDPOINT
DB_PORT=5432
ALLOWED_HOSTS=YOUR_EC2_IP,localhost
CORS_ALLOWED_ORIGINS=http://YOUR_S3_BUCKET_URL,http://YOUR_EC2_IP
```

---

## Step 5 — Run Django Setup

```bash
source venv/bin/activate
export DJANGO_SETTINGS_MODULE=config.settings_production

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Load sample data
python create_sample_data.py

# Collect static files
python manage.py collectstatic --no-input
```

---

## Step 6 — Setup Gunicorn Service

```bash
sudo tee /etc/systemd/system/gunicorn.service > /dev/null << 'EOF'
[Unit]
Description=Gunicorn for Asset Management
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/var/www/asset-management
Environment="DJANGO_SETTINGS_MODULE=config.settings_production"
EnvironmentFile=/var/www/asset-management/.env
ExecStart=/var/www/asset-management/venv/bin/gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable gunicorn
sudo systemctl start gunicorn
sudo systemctl status gunicorn
```

---

## Step 7 — Setup Nginx

```bash
sudo tee /etc/nginx/sites-available/asset-management > /dev/null << 'EOF'
server {
    listen 80;
    server_name YOUR_EC2_IP;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }

    location /static/ {
        alias /var/www/asset-management/staticfiles/;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/asset-management /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 8 — Update Frontend API URL

On your LOCAL machine:
```powershell
# Edit frontend/.env.production
# Change to your EC2 IP:
# REACT_APP_API_URL=http://YOUR_EC2_IP/api

# Rebuild
cd frontend
npm run build

# Re-upload to S3
aws s3 sync build/ s3://YOUR_BUCKET_NAME/ --delete --acl public-read
```

---

## Final URLs

| Service | URL |
|---------|-----|
| React Frontend | http://YOUR_BUCKET.s3-website-us-east-1.amazonaws.com |
| Django API | http://YOUR_EC2_IP/api/ |
| Django Admin | http://YOUR_EC2_IP/admin/ |

---

## Test Everything

```powershell
# Test API
Invoke-RestMethod -Uri "http://YOUR_EC2_IP/api/"

# Test Login
Invoke-RestMethod -Uri "http://YOUR_EC2_IP/api/auth/login/" -Method POST -Body (@{email="admin@example.com"; password="admin123"} | ConvertTo-Json) -ContentType "application/json"
```