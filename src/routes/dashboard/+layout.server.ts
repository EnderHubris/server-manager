import { redirect } from '@sveltejs/kit';

import { db } from '$lib/database/db';
import { sessions, users } from '$lib/database/app-schema';
import { eq } from 'drizzle-orm';

export const load = async ({ cookies }) => {
    const sessionId = cookies.get('session_id');
    if (!sessionId) throw redirect(303, '/auth/login');

    try {
        const session = await db
        .select()
        .from(sessions)
        .innerJoin(users, eq(sessions.uid, users.id))
        .where(eq(sessions.id, sessionId))
        .limit(1);

        if (!session.length)
            throw redirect(303, '/auth/login');
    } catch (e) {
        throw redirect(303, '/auth/login');
    }
};