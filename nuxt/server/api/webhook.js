import { exec } from 'child_process';

export default defineEventHandler(async (event) => {
    // Parse the incoming webhook payload
    const body = await readBody(event);

    // Verify the event is a push event
    if (event.req.headers['x-github-event'] !== 'push') {
        return { status: 'ignored', message: 'Not a push event' };
    }

    // Log the push event for debugging
    console.log('GitHub Push Event:', body);

    // Execute the commands to pull the latest changes, install dependencies, build the site, and restart PM2
    exec('git pull origin main && npm install && npm run build && pm2 restart pimeduse-arhiiv', {
        cwd: '/Users/juljus/Documents/GitHub/pimeduse-arhiiv/nuxt',
        shell: '/bin/bash',
        env: { ...process.env, PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin' }
    }, (error, stdout, stderr) => {
        if (error) {
            console.error('Error executing commands:', error);
            return;
        }
        console.log('Git Pull, Build, and PM2 Restart Output:', stdout);
        console.error('Git Pull, Build, and PM2 Restart Errors:', stderr);
    });

    return { status: 'success', message: 'Site updated successfully' };
});
