import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

// Convert callback-based exec to Promise-based
const exec = promisify(execCallback);

// Configuration with specific paths from your Debian server
const CONFIG = {
  // Project path
  projectPath: '/home/juljus/pimeduse-arhiiv/nuxt',
  // The branch to pull from
  branch: 'main',
  // PM2 app name
  pm2AppName: 'pimeduse-arhiiv',
  // Full paths to executables from your system
  nodePath: '/home/juljus/.nvm/versions/node/v22.15.0/bin/node',
  npmPath: '/home/juljus/.nvm/versions/node/v22.15.0/bin/npm',
  // Path to NVM script to ensure environment is properly set up
  nvmPath: '/home/juljus/.nvm/nvm.sh'
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
    
    // Execute the commands with full paths to npm and node
    // We're also sourcing NVM to ensure the environment is properly set up
    const updateCommand = `source ${CONFIG.nvmPath} && ` +
                          `cd ${CONFIG.projectPath} && ` +
                          `git pull origin ${CONFIG.branch} && ` +
                          `${CONFIG.npmPath} install && ` +
                          `${CONFIG.npmPath} run build && ` +
                          `pm2 restart ${CONFIG.pm2AppName}`;
    
    console.log('Starting deployment process...');
    console.log('Command to execute:', updateCommand);
    
    // Run the commands and wait for completion
    const { stdout, stderr } = await exec(updateCommand, {
      shell: '/bin/bash',
      env: { 
        ...process.env,
        // Add Node.js directory to PATH
        PATH: `${process.env.PATH}:/home/juljus/.nvm/versions/node/v22.15.0/bin:/usr/local/bin:/usr/bin:/bin`
      },
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
