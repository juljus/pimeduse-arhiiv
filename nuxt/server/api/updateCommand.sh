#!/bin/bash
# This script handles the deployment process for the Nuxt website

echo "=== Starting deployment at $(date) ==="

# Debug: Print current user
echo "Running as user: $(whoami)"

# Project configuration
PROJECT_PATH="/home/juljus/pimeduse-arhiiv/nuxt"
BRANCH="main"
PM2_APP_NAME="pimeduse-arhiiv"
GIT_USER="juljus"

# Current user check
CURRENT_USER=$(whoami)
echo "Current user is: $CURRENT_USER"

# Change to project directory
echo "Changing to project directory: $PROJECT_PATH"
cd $PROJECT_PATH || { echo "Failed to change directory to $PROJECT_PATH"; exit 1; }

# Pull latest changes
echo "Pulling latest changes from GitHub..."
git pull origin $BRANCH

# If running as root, switch to juljus user for npm commands
if [ "$CURRENT_USER" = "root" ]; then
    echo "Running npm commands as user $GIT_USER..."
    
    # Create a temporary script to run as the juljus user
    TEMP_SCRIPT="/tmp/deploy_$(date +%s).sh"
    cat > $TEMP_SCRIPT << EOF
#!/bin/bash
cd $PROJECT_PATH
source ~/.nvm/nvm.sh
echo "Installing dependencies..."
npm install
echo "Building the Nuxt application..."
npm run build
echo "Restarting PM2 process..."
pm2 restart $PM2_APP_NAME
EOF
    
    chmod +x $TEMP_SCRIPT
    su - $GIT_USER -c "bash $TEMP_SCRIPT"
    rm $TEMP_SCRIPT
else
    # Load NVM if running as juljus
    source ~/.nvm/nvm.sh
    
    # Install dependencies
    echo "Installing dependencies..."
    npm install
    
    # Build the application
    echo "Building the Nuxt application..."
    npm run build
    
    # Restart PM2 process
    echo "Restarting PM2 process..."
    pm2 restart $PM2_APP_NAME
fi

echo "Deployment completed successfully at $(date)!"
exit 0

