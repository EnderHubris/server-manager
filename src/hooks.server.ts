import cron from 'node-cron';
import { cleanExpiredSessions } from '$lib/jobs/cleanup';

// runs every day at midnight
cron.schedule('0 0 * * *', cleanExpiredSessions);