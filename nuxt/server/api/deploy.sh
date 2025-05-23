#!/bin/bash

# Navigate to the project directory using BASH_SOURCE
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd ../.. && pwd)"

cd "$PROJECT_DIR" || {
  echo "Error: Could not change to project directory $PROJECT_DIR"
  exit 1
}

echo "Changed to project directory: $(pwd)"

# Exit immediately if a command exits with a non-zero status.
set -e

# Add SSH key for GitHub
# Make sure you have set up an SSH key for GitHub and added the public key to your repository's deploy keys.
# You might need to start the ssh-agent and add your key if it's not already loaded.
# eval "$(ssh-agent -s)"
# ssh-add ~/.ssh/your_github_private_key # Replace with your private key path

# Pull the latest changes from the main branch (or your default branch)
# Ensure your server has git installed and configured.
# It's also good practice to ensure the local branch is clean or to stash changes.
# git stash
git pull origin main # Or your primary branch name
# git stash pop # If you stashed changes

# Install/update dependencies
# Assuming you are using npm. If you use yarn or pnpm, change accordingly.
# Also, ensure Node.js and npm/yarn/pnpm are installed on your server.
echo "Installing dependencies..."
npm install

# Build the Nuxt application
echo "Building the Nuxt application..."
npm run build

# Restart the application with PM2
APP_NAME="pimeduse-arhiiv" # Your PM2 app name, confirmed as existing.

echo "Restarting application '$APP_NAME' with PM2..."
pm2 restart $APP_NAME

# 'pm2 restart' will restart the process if it is found (even if stopped).
# If it were critical to start it if it was somehow removed from PM2's list,
# the previous logic with 'pm2 describe' and 'pm2 start' would be more robust.
# However, based on your confirmation, we assume '$APP_NAME' is an existing, managed PM2 process.

echo "Deployment finished successfully."
