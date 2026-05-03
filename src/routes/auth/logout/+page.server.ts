import { redirect } from "@sveltejs/kit";

import { db } from '$lib/database/db';
import { sessions } from '$lib/database/app-schema';
import { eq } from 'drizzle-orm';

export const actions = {
    default: async ({ cookies }) => {
        const sessionId = cookies.get('session_id');

        if (sessionId) {
            console.log(`[LOGOUT] sessid: ${sessionId.slice(0, 6)} has logged out`);
            await db.delete(sessions).where(eq(sessions.id, sessionId));
            cookies.delete('session_id', { path: '/' });
        }

        throw redirect(303, '/auth/login');
    }
};