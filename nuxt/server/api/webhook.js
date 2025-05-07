import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Convert callback-based exec to Promise-based
const exec = promisify(execCallback);

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
    
    // Hard-coded path to the update script on the server
    // This is the path to the script in your source repository, not in the build output
    const scriptPath = '/home/juljus/pimeduse-arhiiv/nuxt/server/api/updateCommand.sh';
    
    console.log('Checking if script exists at:', scriptPath);
    
    // Check if the file exists before attempting to execute it
    try {
      await promisify(fs.access)(scriptPath, fs.constants.F_OK);
      console.log('Script file found, proceeding with execution');
    } catch (e) {
      console.error('Script file not found at path:', scriptPath);
      console.log('Current working directory:', process.cwd());
      console.log('Attempting to list directory contents...');
      try {
        const { stdout: lsOutput } = await exec('ls -la /home/juljus/pimeduse-arhiiv/nuxt/server/api/');
        console.log('Directory contents:', lsOutput);
      } catch (lsError) {
        console.error('Error listing directory:', lsError.message);
      }
      throw new Error(`Script file not found: ${scriptPath}`);
    }
    
    console.log('Making script executable...');
    await exec(`chmod +x ${scriptPath}`);
    
    console.log('Executing deployment script at:', scriptPath);
    
    // Run the script in a bash login shell to ensure all environment variables are loaded
    const { stdout, stderr } = await exec(`bash -l ${scriptPath}`, {
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
