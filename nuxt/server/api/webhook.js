import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

// Convert callback-based exec to Promise-based
const exec = promisify(execCallback);

// Configuration - adjust these for your Debian server
const CONFIG = {
  // This path should be the correct path on your Debian server
  projectPath: process.env.PROJECT_PATH || '/home/juljus/pimeduse-arhiiv/nuxt',
  // The branch to pull from
  branch: process.env.GIT_BRANCH || 'main',
  // PM2 app name
  pm2AppName: process.env.PM2_APP_NAME || 'pimeduse-arhiiv'
};

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
    
    // Execute the commands to pull the latest changes, install dependencies, build the site, and restart PM2
    const updateCommand = `cd ${CONFIG.projectPath} && ` +
                          `git pull origin ${CONFIG.branch} && ` +
                          `npm install && ` +
                          `npm run build && ` +
                          `pm2 restart ${CONFIG.pm2AppName}`;
    
    console.log('Starting deployment process...');
    
    // Run the commands and wait for completion
    const { stdout, stderr } = await exec(updateCommand, {
      shell: '/bin/bash',
      env: { 
        ...process.env, 
        PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/nodejs/bin'
      },
      maxBuffer: 1024 * 1024 // 1MB buffer for larger outputs
    });
    
    console.log('Deployment output:', stdout);
    if (stderr) console.error('Deployment errors:', stderr);
    
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
