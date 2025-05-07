import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import fs from 'fs';

// Convert callback-based exec to Promise-based
const exec = promisify(execCallback);
const writeFile = promisify(fs.writeFile);

export default defineEventHandler(async (event) => {
  try {
    // Parse the incoming webhook payload
    const body = await readBody(event);
    
    // Verify the event is a push event
    if (event.node.req.headers['x-github-event'] !== 'push') {
      return { status: 'ignored', message: 'Not a push event' };
    }
    
    // Log the push event for debugging
    console.log('GitHub Push Event received:', new Date().toISOString());
    console.log('Event details:', body.repository?.full_name, 'ref:', body.ref);
    
    // Create a deployment script in a location that's guaranteed to be accessible
    const homeDir = '/home/juljus';
    const deployScript = `${homeDir}/deploy_pimeduse.sh`;
    
    // Script content with full paths and environment setup
    const scriptContent = `#!/bin/bash
# Auto-generated deployment script
echo "=== Starting deployment at $(date) ==="
echo "Running as user: $(whoami)"

# Source NVM to get access to npm
source ${homeDir}/.nvm/nvm.sh

# Project configuration
PROJECT_PATH="${homeDir}/pimeduse-arhiiv/nuxt"
BRANCH="main"
PM2_APP_NAME="pimeduse-arhiiv"

# Change to project directory
echo "Changing to project directory: $PROJECT_PATH"
cd $PROJECT_PATH || { echo "Failed to change directory"; exit 1; }

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

echo "Deployment completed successfully at $(date)!"
exit 0
`;
    
    console.log('Writing deployment script to:', deployScript);
    
    // Write the script to the file system
    await writeFile(deployScript, scriptContent, {mode: 0o755});
    
    console.log('Executing deployment script');
    
    // Run the script in a login shell
    const { stdout, stderr } = await exec(`bash -l ${deployScript}`, {
      maxBuffer: 1024 * 1024 // 1MB buffer for larger outputs
    });
    
    console.log('Deployment output:', stdout);
    if (stderr && stderr.trim()) console.error('Deployment errors:', stderr);
    
    return { 
      status: 'success', 
      message: 'Site updated successfully',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Deployment failed:', error);
    return { 
      status: 'error', 
      message: `Deployment failed: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
});
