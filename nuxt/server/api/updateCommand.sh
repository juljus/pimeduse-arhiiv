#!/bin/bash
# This script handles the deployment process for the Nuxt website

# Load environment settings
source ~/.bashrc
source ~/.profile
source ~/.nvm/nvm.sh

# Project configuration
PROJECT_PATH="/home/juljus/pimeduse-arhiiv/nuxt"
BRANCH="main"
PM2_APP_NAME="pimeduse-arhiiv"

# Change to project directory
cd $PROJECT_PATH

# Pull latest changes
echo "Pulling latest changes from GitHub..."
git pull origin $BRANCH

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building the Nuxt application..."
npm run build

# Restart PM2 process
echo "Restarting PM2 process..."
pm2 restart $PM2_APP_NAME

echo "Deployment completed successfully!"
exit 0

