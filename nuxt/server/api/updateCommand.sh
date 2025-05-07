#!/bin/bash
# This script handles the deployment process for the Nuxt website

echo "=== Starting deployment at $(date) ==="

# Debug: Print current user
echo "Running as user: $(whoami)"

# Debug: Print current directory
echo "Current directory: $(pwd)"

# Load environment settings - with error checking
echo "Loading environment settings..."
[[ -f ~/.bashrc ]] && source ~/.bashrc
[[ -f ~/.profile ]] && source ~/.profile
[[ -f ~/.nvm/nvm.sh ]] && source ~/.nvm/nvm.sh

# Debug: Check if NVM is available
echo "NVM version: $(nvm --version 2>/dev/null || echo 'NVM not available')"

# Debug: Print PATH variable
echo "PATH: $PATH"

# Absolute paths to binaries
NPM_PATH="/home/juljus/.nvm/versions/node/v22.15.0/bin/npm"
NODE_PATH="/home/juljus/.nvm/versions/node/v22.15.0/bin/node"
GIT_PATH="/usr/bin/git"
PM2_PATH="/home/juljus/.nvm/versions/node/v22.15.0/bin/pm2"

# Debug: Check if executables exist
echo "Checking executables..."
echo "NPM exists: $([[ -x $NPM_PATH ]] && echo 'Yes' || echo 'No')"
echo "Node exists: $([[ -x $NODE_PATH ]] && echo 'Yes' || echo 'No')"
echo "Git exists: $([[ -x $GIT_PATH ]] && echo 'Yes' || echo 'No')"
echo "PM2 exists: $([[ -x $PM2_PATH ]] && echo 'Yes' || echo 'No')"

# Project configuration
PROJECT_PATH="/home/juljus/pimeduse-arhiiv/nuxt"
BRANCH="main"
PM2_APP_NAME="pimeduse-arhiiv"

# Change to project directory
echo "Changing to project directory: $PROJECT_PATH"
cd $PROJECT_PATH || { echo "Failed to change directory to $PROJECT_PATH"; exit 1; }

# Pull latest changes
echo "Pulling latest changes from GitHub..."
$GIT_PATH pull origin $BRANCH

# Install dependencies
echo "Installing dependencies..."
$NPM_PATH install

# Build the application
echo "Building the Nuxt application..."
$NPM_PATH run build

# Restart PM2 process
echo "Restarting PM2 process..."
$PM2_PATH restart $PM2_APP_NAME

echo "Deployment completed successfully at $(date)!"
exit 0

