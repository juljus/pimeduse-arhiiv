import { defineEventHandler, readBody } from 'h3';
import { exec } from 'child_process';
// import crypto from 'crypto'; // No longer needed for basic version
import path from 'path';

// IMPORTANT: GitHub secret verification has been removed for now.
// const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET; // Removed

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    event.node.res.statusCode = 405;
    return { error: 'Method Not Allowed' };
  }

  // const signature = event.node.req.headers['x-hub-signature-256']; // Removed
  // const body = await readBody(event); // Body might still be needed if you want to inspect payload for specific branches, etc.
                                      // For now, just reading it to be consistent with original structure if body parsing is expected by h3 or the event.
  await readBody(event);


  // Secret verification block removed
  // if (!GITHUB_WEBHOOK_SECRET) { ... } // Removed
  // if (!signature) { ... } // Removed
  // const hmac = crypto.createHmac(...) // Removed
  // const digest = Buffer.from(...) // Removed
  // const receivedSignature = Buffer.from(...) // Removed
  // if (!crypto.timingSafeEqual(...)) { ... } // Removed

  const githubEvent = event.node.req.headers['x-github-event'];

  if (githubEvent === 'ping') {
    return { message: 'Webhook configured successfully (ping received). No secret verification.' };
  }

  if (githubEvent === 'push') {
    const scriptPath = path.resolve(process.cwd(), 'server/api/deploy.sh');
    
    console.log(`Executing deploy script (no secret verification): ${scriptPath}`);

    exec(`sh ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing deploy script: ${error.message}`);
        return;
      }
      if (stderr) {
        console.warn(`Deploy script STDERR: ${stderr}`);
      }
      console.log(`Deploy script STDOUT: ${stdout}`);
    });

    return { message: 'Webhook received. Deployment process initiated (no secret verification).' };
  }

  event.node.res.statusCode = 400;
  return { error: 'Unhandled GitHub event type.' };
});
