# ============================================================
# DEPLOY NOW - Asset Management System to AWS
# Fill in your values below before running!
# ============================================================

# ---- FILL THESE IN ----
$EC2_IP       = "YOUR_EC2_PUBLIC_IP"          # e.g. "54.123.45.67"
$RDS_ENDPOINT = "YOUR_RDS_ENDPOINT"           # e.g. "asset-management-db.xxxx.us-east-1.rds.amazonaws.com"
$DB_PASSWORD  = "AssetMgmt2024!"              # password you set in RDS
$KEY_FILE     = "asset-management-key.pem"    # path to your downloaded .pem file
$BUCKET_NAME  = "asset-management-$(Get-Random -Maximum 99999)"
$REGION       = "us-east-1"
# -----------------------

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Deploying Asset Management System to AWS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Verify AWS credentials
Write-Host "`n[1/6] Verifying AWS credentials..." -ForegroundColor Yellow
$identity = aws sts get-caller-identity --output json | ConvertFrom-Json
Write-Host "Logged in as: $($identity.Arn)" -ForegroundColor Green

# Create S3 bucket and upload frontend
Write-Host "`n[2/6] Creating S3 bucket and uploading React frontend..." -ForegroundColor Yellow
aws s3api create-bucket --bucket $BUCKET_NAME --region $REGION
aws s3api put-public-access-block --bucket $BUCKET_NAME --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

$policy = '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::' + $BUCKET_NAME + '/*"}]}'
$policy | Out-File -FilePath "tmp_policy.json" -Encoding utf8
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://tmp_policy.json
Remove-Item "tmp_policy.json"

aws s3 website s3://$BUCKET_NAME/ --index-document index.html --error-document index.html

# Update API URL in frontend
Write-Host "`n[3/6] Updating frontend API URL for production..." -ForegroundColor Yellow
$envContent = "REACT_APP_API_URL=http://$EC2_IP/api"
$envContent | Out-File -FilePath "frontend/.env.production" -Encoding utf8

# Rebuild frontend with production API URL
Write-Host "`n[4/6] Building React frontend for production..." -ForegroundColor Yellow
Set-Location frontend
npm run build
Set-Location ..

# Upload to S3
Write-Host "`n[5/6] Uploading frontend to S3..." -ForegroundColor Yellow
aws s3 sync frontend/build/ s3://$BUCKET_NAME/ --delete --acl public-read
$FRONTEND_URL = "http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
Write-Host "Frontend live at: $FRONTEND_URL" -ForegroundColor Green

# Create backend .env for EC2
Write-Host "`n[6/6] Creating production .env file..." -ForegroundColor Yellow
$envProd = @"
DEBUG=False
SECRET_KEY=asset-mgmt-prod-$(Get-Random -Maximum 999999)-secret-key-very-long
DATABASE_URL=postgresql://admin:$DB_PASSWORD@${RDS_ENDPOINT}:5432/asset_management
DB_NAME=asset_management
DB_USER=admin
DB_PASSWORD=$DB_PASSWORD
DB_HOST=$RDS_ENDPOINT
DB_PORT=5432
ALLOWED_HOSTS=$EC2_IP,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://$FRONTEND_URL,http://$EC2_IP
"@
$envProd | Out-File -FilePath ".env.production" -Encoding utf8

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "Frontend URL:  $FRONTEND_URL" -ForegroundColor Cyan
Write-Host "Backend IP:    $EC2_IP" -ForegroundColor Cyan
Write-Host "S3 Bucket:     $BUCKET_NAME" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT: SSH into EC2 and run setup_backend.sh" -ForegroundColor Yellow
Write-Host "SSH Command:" -ForegroundColor Yellow
Write-Host "  ssh -i $KEY_FILE ubuntu@$EC2_IP" -ForegroundColor White