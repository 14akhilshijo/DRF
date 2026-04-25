#!/bin/bash
set -e
exec > /var/log/userdata.log 2>&1

echo "=== Starting EC2 Setup ==="

# Update system
apt update && apt upgrade -y

# Install dependencies
apt install -y python3.11 python3.11-venv python3.11-dev python3-pip nginx git libpq-dev

# Create app directory
mkdir -p /var/www/asset-management
chown ubuntu:ubuntu /var/www/asset-management

# Install pip packages into venv (will be done after code upload)
# Create a ready-flag directory
mkdir -p /home/ubuntu/setup_flags

echo "=== Base setup complete. Waiting for code upload. ===" 
touch /home/ubuntu/setup_flags/base_ready
