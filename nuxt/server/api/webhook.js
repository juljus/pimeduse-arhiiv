import { defineEventHandler, readBody } from 'h3';
import { exec } from 'child_process';
import crypto from 'crypto'; // Import crypto for hashing
import path from 'path';

// IMPORTANT: Set this environment variable on your server
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    event.node.res.statusCode = 405;
    return { error: 'Method Not Allowed' };
  }

  const signature = event.node.req.headers['x-hub-signature-256'];
  // It's important to read the raw body as a Buffer for accurate hash calculation,
  // but h3's readBody parses it. We'll stringify it back for the HMAC calculation.
  // For more robust handling, especially with different charsets, using a middleware
  // that provides the raw buffer before h3 parses it would be ideal, but this is a common approach.
  const body = await readBody(event);
  const bodyString = JSON.stringify(body); // GitHub sends JSON payload

  if (!GITHUB_WEBHOOK_SECRET) {
    console.error('CRITICAL: GITHUB_WEBHOOK_SECRET is not set on the server.');
    event.node.res.statusCode = 500;
    return { error: 'Server configuration error: Webhook secret not set.' };
  }

  if (!signature) {
    console.warn('Webhook request received without a signature.');
    event.node.res.statusCode = 401;
    return { error: 'No signature provided. Ensure webhook is configured with a secret.' };
  }

  const hmac = crypto.createHmac('sha256', GITHUB_WEBHOOK_SECRET);
  const digest = Buffer.from('sha256=' + hmac.update(bodyString).digest('hex'), 'utf8');
  const receivedSignature = Buffer.from(signature, 'utf8');

  if (!crypto.timingSafeEqual(digest, receivedSignature)) {
    console.warn('Invalid webhook signature received.');
    event.node.res.statusCode = 401;
    return { error: 'Invalid signature.' };
  }

  // GitHub event type, e.g., 'push'
  const githubEvent = event.node.req.headers['x-github-event'];

  if (githubEvent === 'ping') {
    return { message: 'Webhook configured successfully (ping received, signature verified).' };
  }

  if (githubEvent === 'push') {
    const scriptPath = '/home/juljus/pimeduse-arhiiv/nuxt/server/api/deploy.sh';
    
    console.log(`Executing deploy script (signature verified, absolute path): ${scriptPath}`);

    exec(`bash ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing deploy script: ${error.message}`);
        return;
      }
      if (stderr) {
        console.warn(`Deploy script STDERR: ${stderr}`);
      }
      console.log(`Deploy script STDOUT: ${stdout}`);
    });

    return { message: 'Webhook received and verified. Deployment process initiated.' };
  }

  event.node.res.statusCode = 400;
  return { error: 'Unhandled GitHub event type.' };
});
