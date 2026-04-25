# ============================================================
# AWS Deployment Script - Asset Management System
# Run this script after configuring AWS CLI
# ============================================================

param(
    [string]$BucketName = "asset-management-frontend-$(Get-Random -Maximum 9999)",
    [string]$Region = "us-east-1"
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  AWS Deployment - Asset Management System" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Step 1: Verify AWS CLI is configured
Write-Host "`nStep 1: Verifying AWS credentials..." -ForegroundColor Yellow
$identity = aws sts get-caller-identity --output json 2>&1 | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: AWS CLI not configured. Run: aws configure" -ForegroundColor Red
    exit 1
}
Write-Host "Logged in as: $($identity.Arn)" -ForegroundColor Green
$AccountId = $identity.Account

# Step 2: Create S3 bucket for frontend
Write-Host "`nStep 2: Creating S3 bucket for React frontend..." -ForegroundColor Yellow
if ($Region -eq "us-east-1") {
    aws s3api create-bucket --bucket $BucketName --region $Region
} else {
    aws s3api create-bucket --bucket $BucketName --region $Region --create-bucket-configuration LocationConstraint=$Region
}

# Disable block public access
aws s3api put-public-access-block --bucket $BucketName --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Set bucket policy for public read
$BucketPolicy = @{
    Version = "2012-10-17"
    Statement = @(
        @{
            Sid = "PublicReadGetObject"
            Effect = "Allow"
            Principal = "*"
            Action = "s3:GetObject"
            Resource = "arn:aws:s3:::$BucketName/*"
        }
    )
} | ConvertTo-Json -Depth 5

$BucketPolicy | Out-File -FilePath "bucket-policy.json" -Encoding utf8
aws s3api put-bucket-policy --bucket $BucketName --policy file://bucket-policy.json
Remove-Item "bucket-policy.json"

# Enable static website hosting
aws s3 website s3://$BucketName/ --index-document index.html --error-document index.html
Write-Host "S3 Bucket created: $BucketName" -ForegroundColor Green

# Step 3: Upload React build to S3
Write-Host "`nStep 3: Uploading React frontend to S3..." -ForegroundColor Yellow
aws s3 sync frontend/build/ s3://$BucketName/ --delete --acl public-read
Write-Host "Frontend uploaded successfully!" -ForegroundColor Green

$FrontendURL = "http://$BucketName.s3-website-$Region.amazonaws.com"
Write-Host "Frontend URL: $FrontendURL" -ForegroundColor Cyan

# Step 4: Create EC2 Key Pair
Write-Host "`nStep 4: Creating EC2 Key Pair..." -ForegroundColor Yellow
$KeyName = "asset-management-key"
aws ec2 create-key-pair --key-name $KeyName --query "KeyMaterial" --output text | Out-File -FilePath "$KeyName.pem" -Encoding ascii
Write-Host "Key pair saved: $KeyName.pem" -ForegroundColor Green
Write-Host "IMPORTANT: Keep this file safe - you need it to SSH into EC2!" -ForegroundColor Red

# Step 5: Create Security Group
Write-Host "`nStep 5: Creating Security Group..." -ForegroundColor Yellow
$SGId = aws ec2 create-security-group --group-name "asset-management-sg" --description "Asset Management System Security Group" --query "GroupId" --output text
aws ec2 authorize-security-group-ingress --group-id $SGId --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SGId --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SGId --protocol tcp --port 443 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SGId --protocol tcp --port 8000 --cidr 0.0.0.0/0
Write-Host "Security Group created: $SGId" -ForegroundColor Green

# Step 6: Get latest Ubuntu 22.04 AMI
Write-Host "`nStep 6: Finding Ubuntu 22.04 AMI..." -ForegroundColor Yellow
$AmiId = aws ec2 describe-images --owners 099720109477 --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" "Name=state,Values=available" --query "sort_by(Images, &CreationDate)[-1].ImageId" --output text
Write-Host "Using AMI: $AmiId" -ForegroundColor Green

# Step 7: Create EC2 User Data script
$UserData = @"
#!/bin/bash
apt update && apt upgrade -y
apt install -y python3.11 python3.11-venv python3.11-dev python3-pip nginx git libpq-dev

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

mkdir -p /var/www/asset-management
chown ubuntu:ubuntu /var/www/asset-management

# Create startup script
cat > /home/ubuntu/setup_app.sh << 'SETUP'
#!/bin/bash
cd /var/www/asset-management
python3.11 -m venv venv
source venv/bin/activate
pip install Django==5.0.0 djangorestframework==3.14.0 djangorestframework-simplejwt==5.3.0 django-filter==23.5 django-cors-headers==4.3.1 python-decouple==3.8 dj-database-url==2.1.0 gunicorn==21.2.0 whitenoise==6.6.0
SETUP
chmod +x /home/ubuntu/setup_app.sh
"@

$UserDataEncoded = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($UserData))

# Step 8: Launch EC2 Instance
Write-Host "`nStep 7: Launching EC2 Instance..." -ForegroundColor Yellow
$InstanceId = aws ec2 run-instances `
    --image-id $AmiId `
    --instance-type t2.micro `
    --key-name $KeyName `
    --security-group-ids $SGId `
    --user-data $UserDataEncoded `
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=asset-management-backend}]" `
    --query "Instances[0].InstanceId" `
    --output text

Write-Host "EC2 Instance launched: $InstanceId" -ForegroundColor Green
Write-Host "Waiting for instance to start (this takes ~2 minutes)..." -ForegroundColor Yellow

# Wait for instance to be running
aws ec2 wait instance-running --instance-ids $InstanceId
Write-Host "Instance is running!" -ForegroundColor Green

# Get public IP
$PublicIP = aws ec2 describe-instances --instance-ids $InstanceId --query "Reservations[0].Instances[0].PublicIpAddress" --output text
Write-Host "EC2 Public IP: $PublicIP" -ForegroundColor Cyan

# Step 9: Create RDS PostgreSQL
Write-Host "`nStep 8: Creating RDS PostgreSQL Database..." -ForegroundColor Yellow
$DBPassword = "AssetMgmt$(Get-Random -Maximum 9999)!"
aws rds create-db-instance `
    --db-instance-identifier asset-management-db `
    --db-instance-class db.t3.micro `
    --engine postgres `
    --engine-version "15.4" `
    --master-username admin `
    --master-user-password $DBPassword `
    --db-name asset_management `
    --allocated-storage 20 `
    --no-multi-az `
    --publicly-accessible `
    --vpc-security-group-ids $SGId `
    --backup-retention-period 7 `
    --tags "Key=Name,Value=asset-management-db" 2>&1 | Out-Null

Write-Host "RDS instance creation started (takes ~5 minutes)..." -ForegroundColor Yellow
Write-Host "DB Password: $DBPassword" -ForegroundColor Red
Write-Host "SAVE THIS PASSWORD!" -ForegroundColor Red

# Save deployment info
$DeployInfo = @"
============================================
  DEPLOYMENT INFORMATION - SAVE THIS!
============================================
EC2 Instance ID:  $InstanceId
EC2 Public IP:    $PublicIP
S3 Bucket:        $BucketName
Frontend URL:     $FrontendURL
DB Password:      $DBPassword
Key Pair File:    $KeyName.pem
Security Group:   $SGId
Region:           $Region
Account ID:       $AccountId

SSH Command:
  ssh -i "$KeyName.pem" ubuntu@$PublicIP

Next Steps:
  1. Wait 5 minutes for RDS to be ready
  2. Get RDS endpoint from AWS Console
  3. SSH into EC2 and run setup
  4. See NEXT_STEPS.md for detailed instructions
============================================
"@

$DeployInfo | Out-File -FilePath "DEPLOYMENT_INFO.txt" -Encoding utf8
Write-Host $DeployInfo -ForegroundColor Cyan

Write-Host "`nDeployment Info saved to: DEPLOYMENT_INFO.txt" -ForegroundColor Green
Write-Host "Key pair saved to: $KeyName.pem" -ForegroundColor Green