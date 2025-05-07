import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert callback-based exec to Promise-based
const exec = promisify(execCallback);

// Get the directory of the current file
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    
    // Path to the diagnostic script
    const diagnosticPath = path.join(__dirname, 'diagnostic.sh');
    
    // Make sure the diagnostic script is executable
    await exec(`chmod +x ${diagnosticPath}`);
    
    // Run the diagnostic script first
    console.log('Running diagnostic script to collect environment information...');
    await exec(`bash -l ${diagnosticPath}`).catch(e => {
      console.error('Error running diagnostic script:', e.message);
    });
    
    // Path to the update script
    const scriptPath = path.join(__dirname, 'updateCommand.sh');
    
    console.log('Executing deployment script at:', scriptPath);
    
    // Make sure the script is executable
    await exec(`chmod +x ${scriptPath}`);
    
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
