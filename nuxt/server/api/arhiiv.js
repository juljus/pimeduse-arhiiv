export default defineEventHandler(async () => {
    const fs = await import('fs/promises'); // Dynamic import
    const path = await import('path');
    const directoryPath = path.join(process.cwd(), 'content/arhiiv');
    
    try {
        const files = await fs.readdir(directoryPath); // Read files
        return { files };
    } catch (error) {
        return { error: 'Unable to read directory' };
    }
});
