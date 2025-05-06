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

    // Execute the commands to pull the latest changes and rebuild the site
    exec('git pull && npm install && npm run build', { cwd: process.cwd() }, (error, stdout, stderr) => {
        if (error) {
            console.error('Error executing commands:', error);
            return;
        }
        console.log('Git Pull Output:', stdout);
        console.error('Git Pull Errors:', stderr);
    });

    return { status: 'success', message: 'Site updated successfully' };
});