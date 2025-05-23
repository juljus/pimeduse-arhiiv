import { defineEventHandler, readBody } from 'h3';
import { exec } from 'child_process';
import crypto from 'crypto';
import path from 'path';

// IMPORTANT: Set this environment variable on your server
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    event.node.res.statusCode = 405;
    return { error: 'Method Not Allowed' };
  }

  // Log all headers to help debug
  console.log('Webhook received with headers:', JSON.stringify(event.node.req.headers, null, 2));
  
  // Try both signature header formats that GitHub might use
  const signature = event.node.req.headers['x-hub-signature-256'] || event.node.req.headers['x-hub-signature'];
  
  // It's important to read the raw body as a Buffer for accurate hash calculation,
  // but h3's readBody parses it. We'll stringify it back for the HMAC calculation.
  const body = await readBody(event);
  const bodyString = JSON.stringify(body); // GitHub sends JSON payload
  console.log('Request body received (truncated):', bodyString.substring(0, 100) + '...');

  // Check if webhook secret is configured on the server
  if (!GITHUB_WEBHOOK_SECRET) {
    console.error('CRITICAL: GITHUB_WEBHOOK_SECRET is not set on the server.');
    console.log('Environment variables:', process.env);
    event.node.res.statusCode = 500;
    return { error: 'Server configuration error: Webhook secret not set.' };
  }
  
  console.log('Secret configuration found. Secret length:', GITHUB_WEBHOOK_SECRET.length);

  // Check if signature is provided in the request
  if (!signature) {
    console.warn('Webhook request received without a signature. Expected header x-hub-signature-256 or x-hub-signature.');
    event.node.res.statusCode = 401;
    return { error: 'No signature provided. Ensure webhook is configured with a secret.' };
  }

  try {
    const hmac = crypto.createHmac('sha256', GITHUB_WEBHOOK_SECRET);
    const digest = Buffer.from('sha256=' + hmac.update(bodyString).digest('hex'), 'utf8');
    const receivedSignature = Buffer.from(signature, 'utf8');

    if (!crypto.timingSafeEqual(digest, receivedSignature)) {
      console.warn('Invalid webhook signature received. Secret mismatch or tampering detected.');
      event.node.res.statusCode = 401;
      return { error: 'Invalid signature. Check that the webhook secret matches.' };
    }
  } catch (error) {
    console.error('Signature verification error:', error);
    event.node.res.statusCode = 500;
    return { error: 'Signature verification failed due to technical error.' };
  }

  // GitHub event type, e.g., 'push'
  const githubEvent = event.node.req.headers['x-github-event'];

  if (githubEvent === 'ping') {
    return { message: 'Webhook configured successfully (ping received, signature verified).' };
  }

  if (githubEvent === 'push') {
    const scriptPath = '/var/www/pimeduse-arhiiv/nuxt/server/api/deploy.sh';
    
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
