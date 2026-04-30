#!/bin/bash

# Digital Nomad Blog Deployment Script

set -e

echo "Starting deployment..."

# Build the application
echo "Building application..."
npm run build

# Create logs directory
mkdir -p logs

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found. Installing..."
    npm install -g pm2
fi

# Check if app is already running
if pm2 list | grep -q "digital-nomad-blog"; then
    echo "Restarting application..."
    pm2 restart ecosystem.config.js
else
    echo "Starting application..."
    pm2 start ecosystem.config.js
fi

# Save PM2 configuration
pm2 save

echo "Deployment complete!"
echo ""
echo "Status:"
pm2 status
