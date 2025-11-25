#!/bin/bash

# Deployment script for Node.js application
# This script will be executed on the production server

set -e  # Exit on error

APP_DIR="/var/www/nodejs-app"
APP_NAME="nodejs-cicd-app"
PM2_APP_NAME="nodejs-app"

echo "=========================================="
echo "Starting Deployment Process"
echo "=========================================="

# Navigate to application directory
cd $APP_DIR

# Create backup of current deployment
if [ -d "current" ]; then
    echo "Creating backup of current deployment..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    cp -r current "backup_${TIMESTAMP}"
    
    # Keep only last 3 backups
    ls -t backup_* | tail -n +4 | xargs -r rm -rf
    echo "Backup created: backup_${TIMESTAMP}"
fi

# Remove old deployment
rm -rf current
mkdir -p current

echo "Application directory prepared"

# Note: Files will be copied by Jenkins using scp

echo "=========================================="
echo "Installing Dependencies"
echo "=========================================="

cd $APP_DIR/current

# Install production dependencies
npm ci --only=production

echo "=========================================="
echo "Setting Environment Variables"
echo "=========================================="

# Create .env file if needed
cat > .env << EOF
NODE_ENV=production
PORT=3000
APP_VERSION=${APP_VERSION:-1.0.0}
BUILD_NUMBER=${BUILD_NUMBER:-0}
EOF

echo "Environment variables configured"

echo "=========================================="
echo "Managing Application Process"
echo "=========================================="

# Check if PM2 process exists
if pm2 describe $PM2_APP_NAME > /dev/null 2>&1; then
    echo "Reloading existing PM2 process..."
    pm2 reload $PM2_APP_NAME --update-env
else
    echo "Starting new PM2 process..."
    pm2 start server.js --name $PM2_APP_NAME -i 1
fi

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo "=========================================="
echo "Deployment Status"
echo "=========================================="

pm2 list
pm2 info $PM2_APP_NAME

echo "=========================================="
echo "Deployment Completed Successfully!"
echo "=========================================="
