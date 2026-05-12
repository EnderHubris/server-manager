import cron from 'node-cron';
import { cleanExpiredSessions } from '$lib/jobs/cleanup';

// runs every day at midnight
cron.schedule('0 0 * * *', cleanExpiredSessions);

// needed to handle CSRF issues
import type { Handle } from '@sveltejs/kit';

const ALLOWED_ORIGINS = [
    'http://localhost',
    `http://${process.env.APP_HOST}`
];

export const handle: Handle = async ({ event, resolve }) => {
    const origin = event.request.headers.get('origin');

    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
        return new Response(`Forbidden, disallowed host: ${origin}`, { status: 403 });
    }

    return resolve(event);
};