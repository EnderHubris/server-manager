import { db } from '$lib/database/db';
import { sessions, users } from '$lib/database/app-schema';
import { eq } from 'drizzle-orm';

export async function IsAuthenticated(sessionId: string) : Promise<{
    success: boolean,
    user: { username: string, role: string } | undefined
}> {
    if (sessionId.length === 0)
        return { success: false, user: undefined };

    try {
        // verify authentication
        const session = await db
            .select()
            .from(sessions)
            .innerJoin(users, eq(sessions.uid, users.id))
            .where(eq(sessions.id, sessionId))
            .limit(1);

        if (!session.length)
            return { success: false, user: undefined };

        const userData = {
            username:   session[0].users.username,
            role:       session[0].users.role
        };
        return { success: true, user: userData };
    } catch (e) {
        return { success: false, user: undefined };
    }
}