const schedulerService = require('./src/services/scheduler.service');

async function runUpdate() {
    try {
        console.log('Running auction status update...');
        const result = await schedulerService.updateAuctionStatuses();
        console.log('Update complete:', result);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

runUpdate();
