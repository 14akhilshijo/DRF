#!/bin/bash
# Run these commands in AWS CloudShell

RDS_ENDPOINT="database-1-instance-1.c0py0u06ecvz.us-east-1.rds.amazonaws.com"
DB_USER="postgres"
DB_PASS="AssetMgmt2024!"

# Install psql client
sudo yum install -y postgresql15 2>/dev/null || sudo apt install -y postgresql-client 2>/dev/null

# Create the database
PGPASSWORD=$DB_PASS psql -h $RDS_ENDPOINT -U $DB_USER -c "CREATE DATABASE asset_management;" postgres

# Verify it was created
PGPASSWORD=$DB_PASS psql -h $RDS_ENDPOINT -U $DB_USER -c "\l" postgres

echo "Database setup complete!"