import { db } from '$lib/database/db';
import { sessions, users } from '$lib/database/app-schema';
import { eq } from 'drizzle-orm';

export const load = async ({ cookies }) => {
    const sessionId = cookies.get('session_id');
    if (!sessionId) return;

    const session = await db
        .select()
        .from(sessions)
        .innerJoin(users, eq(sessions.uid, users.id))
        .where(eq(sessions.id, sessionId))
        .limit(1);

    if (!session.length) return;

    const user = {
        name: session[0].users.username,
        role: session[0].users.role,
    };

    console.log(`[USER] username: ${user.name} | role: ${user.role}`);

    return { user };
};