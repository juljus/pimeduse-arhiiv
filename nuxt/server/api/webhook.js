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

    // Execute the commands to pull the latest changes, install dependencies, and build the site
    exec('git pull origin main && npm install && npm run build', { cwd: process.cwd() }, (error, stdout, stderr) => {
        if (error) {
            console.error('Error executing commands:', error);
            return;
        }
        console.log('Git Pull and Build Output:', stdout);
        console.error('Git Pull and Build Errors:', stderr);

        // Restart PM2 process only after the build is complete
        exec('pm2 restart pimeduse-arhiiv', { cwd: process.cwd() }, (pm2Error, pm2Stdout, pm2Stderr) => {
            if (pm2Error) {
                console.error('Error restarting PM2 process:', pm2Error);
                return;
            }
            console.log('PM2 Restart Output:', pm2Stdout);
            console.error('PM2 Restart Errors:', pm2Stderr);
        });
    });

    return { status: 'success', message: 'Site updated successfully' };
});
