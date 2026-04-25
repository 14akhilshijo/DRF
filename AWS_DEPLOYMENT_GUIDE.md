# AWS Deployment Guide - Asset Management System

## Architecture
```
Users → Route 53 → CloudFront → S3 (React)
                              → EC2 + Nginx + Gunicorn (Django)
                                        ↓
                                   RDS PostgreSQL
```

---

## STEP 1 — Create AWS Account & IAM User

1. Go to https://aws.amazon.com and sign in
2. Go to **IAM → Users → Create User**
3. Username: `asset-management-deploy`
4. Attach policies:
   - `AmazonEC2FullAccess`
   - `AmazonRDSFullAccess`
   - `AmazonS3FullAccess`
   - `CloudFrontFullAccess`
5. Create **Access Keys** → Save `Access Key ID` and `Secret Access Key`

---

## STEP 2 — Create RDS PostgreSQL Database

1. Go to **RDS → Create Database**
2. Settings:
   - Engine: **PostgreSQL 15**
   - Template: **Free Tier** (for testing) or **Production**
   - DB Instance: `asset-management-db`
   - Master username: `admin`
   - Master password: `YourStrongPassword123!`
   - DB name: `asset_management`
   - Instance: `db.t3.micro` (free tier)
   - Storage: 20 GB
   - **Public access: NO** (private, only EC2 can connect)
3. Click **Create Database**
4. Wait ~5 minutes, then copy the **Endpoint** (looks like):
   ```
   asset-management-db.xxxx.us-east-1.rds.amazonaws.com
   ```

---

## STEP 3 — Create EC2 Instance (Backend Server)

1. Go to **EC2 → Launch Instance**
2. Settings:
   - Name: `asset-management-backend`
   - AMI: **Ubuntu Server 22.04 LTS**
   - Instance type: `t2.micro` (free tier) or `t3.small`
   - Key pair: Create new → `asset-management-key` → Download `.pem` file
   - Security Group — Add these rules:
     ```
     SSH        TCP  22    My IP
     HTTP       TCP  80    Anywhere (0.0.0.0/0)
     HTTPS      TCP  443   Anywhere (0.0.0.0/0)
     Custom     TCP  8000  Anywhere (for testing only)
     ```
3. Click **Launch Instance**
4. Copy the **Public IP** (e.g., `54.123.45.67`)

---

## STEP 4 — Create S3 Bucket (Frontend)

1. Go to **S3 → Create Bucket**
2. Settings:
   - Bucket name: `asset-management-frontend-yourname`
   - Region: `us-east-1`
   - **Uncheck** "Block all public access"
   - Enable **Static website hosting**
   - Index document: `index.html`
   - Error document: `index.html`
3. Add Bucket Policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::asset-management-frontend-yourname/*"
       }
     ]
   }
   ```

---

## STEP 5 — Connect to EC2 and Setup Backend

### Connect via SSH:
```bash
# On your local machine (Windows PowerShell)
ssh -i "asset-management-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP

# If permission error on Windows:
icacls "asset-management-key.pem" /inheritance:r /grant:r "%USERNAME%:R"
```

### Run setup script on EC2:
```bash
# Upload setup script to EC2
scp -i "asset-management-key.pem" setup_ec2.sh ubuntu@YOUR_EC2_IP:~/

# SSH into EC2
ssh -i "asset-management-key.pem" ubuntu@YOUR_EC2_IP

# Run setup
chmod +x setup_ec2.sh
./setup_ec2.sh
```

### Configure .env on EC2:
```bash
nano /var/www/asset-management/.env
```

Fill in these values:
```env
DEBUG=False
SECRET_KEY=django-prod-secret-key-change-this-to-something-very-long-and-random
DATABASE_URL=postgresql://admin:YourPassword@YOUR_RDS_ENDPOINT:5432/asset_management
DB_NAME=asset_management
DB_USER=admin
DB_PASSWORD=YourStrongPassword123!
DB_HOST=asset-management-db.xxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
ALLOWED_HOSTS=YOUR_EC2_IP,your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com,http://YOUR_EC2_IP
AWS_ACCESS_KEY_ID=YOUR_IAM_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_IAM_SECRET_KEY
AWS_STORAGE_BUCKET_NAME=asset-management-frontend-yourname
AWS_S3_REGION_NAME=us-east-1
```

### Run Django setup:
```bash
cd /var/www/asset-management
source venv/bin/activate
export DJANGO_SETTINGS_MODULE=config.settings_production

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
# Email: admin@yourdomain.com
# Password: YourAdminPassword

# Load sample data
python create_sample_data.py

# Collect static files
python manage.py collectstatic

# Restart services
sudo systemctl restart gunicorn
sudo systemctl restart nginx
```

---

## STEP 6 — Build and Deploy React Frontend

### On your LOCAL machine:
```bash
# Navigate to frontend directory
cd frontend

# Update API URL for production
# Edit src/services/api.js - change BASE_URL:
# const API_BASE_URL = 'https://your-domain.com/api';
# OR
# const API_BASE_URL = 'http://YOUR_EC2_IP/api';

# Build production bundle
npm run build
```

### Upload to S3:
```bash
# Install AWS CLI on your local machine
pip install awscli

# Configure AWS CLI
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output (json)

# Upload build to S3
aws s3 sync build/ s3://asset-management-frontend-yourname --delete
```

---

## STEP 7 — Setup CloudFront (CDN)

1. Go to **CloudFront → Create Distribution**
2. Settings:
   - Origin domain: Your S3 bucket website endpoint
   - Viewer protocol: **Redirect HTTP to HTTPS**
   - Default root object: `index.html`
   - Error pages: Add custom error response:
     - HTTP Error Code: `403`
     - Response page path: `/index.html`
     - HTTP Response Code: `200`
3. Click **Create Distribution**
4. Copy the **CloudFront domain** (e.g., `d1234abcd.cloudfront.net`)

---

## STEP 8 — Setup Domain with Route 53 (Optional)

1. Go to **Route 53 → Hosted Zones → Create Hosted Zone**
2. Domain name: `yourdomain.com`
3. Add records:
   ```
   A Record:  yourdomain.com     → EC2 Elastic IP
   CNAME:     www.yourdomain.com → CloudFront domain
   ```

---

## STEP 9 — SSL Certificate with Let's Encrypt

```bash
# On EC2 - Get free SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

---

## STEP 10 — Update Frontend API URL

```javascript
// frontend/src/services/api.js
const API_BASE_URL = 'https://yourdomain.com/api';
// Rebuild and re-upload to S3
```

---

## STEP 11 — Security Group for RDS

Allow EC2 to connect to RDS:
1. Go to **RDS → Your DB → Security Groups**
2. Edit inbound rules:
   ```
   PostgreSQL  TCP  5432  EC2 Security Group ID
   ```

---

## STEP 12 — Test Your Deployment

```bash
# Test backend API
curl https://yourdomain.com/api/
curl https://yourdomain.com/api/info/

# Test authentication
curl -X POST https://yourdomain.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

---

## Estimated AWS Costs (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| EC2 t2.micro | Free Tier (1 year) | $0 / $8.50 |
| RDS db.t3.micro | Free Tier (1 year) | $0 / $15 |
| S3 | First 5GB free | ~$0.50 |
| CloudFront | First 1TB free | ~$0 |
| Route 53 | Per hosted zone | ~$0.50 |
| **Total** | **Free Tier** | **~$0 - $25/mo** |

---

## Quick Reference — All URLs After Deployment

| Service | URL |
|---------|-----|
| React Frontend | https://yourdomain.com |
| Django API | https://yourdomain.com/api/ |
| Django Admin | https://yourdomain.com/admin/ |
| CloudFront | https://d1234abcd.cloudfront.net |
| S3 Bucket | https://asset-management-frontend.s3.amazonaws.com |

---

## Troubleshooting

### Gunicorn not starting:
```bash
sudo systemctl status gunicorn
sudo journalctl -u gunicorn -n 50
```

### Nginx errors:
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Django errors:
```bash
cd /var/www/asset-management
source venv/bin/activate
python manage.py check --deploy
```

### Database connection issues:
```bash
# Test RDS connection from EC2
psql -h YOUR_RDS_ENDPOINT -U admin -d asset_management
```

---

## Summary — What You Need

1. AWS Account (free tier available)
2. Your project code on GitHub
3. A domain name (optional, ~$12/year)
4. About 30-60 minutes to complete setup