import { db } from '$lib/database/db';
import { sessions, users, instances } from '$lib/database/app-schema';
import { eq } from 'drizzle-orm';

export const load = async ({ cookies }) => {
    const sessionId = cookies.get('session_id');
    if (!sessionId) return;

    try {
        // verify authentication
        const session = await db
            .select()
            .from(sessions)
            .innerJoin(users, eq(sessions.uid, users.id))
            .where(eq(sessions.id, sessionId))
            .limit(1);
        if (!session.length) return;
        
        // fetch server entries
        const servers = await db.select({
            name:           instances.name,
            description:    instances.description,
            icon:           instances.icon,
            createdAt:      instances.createdAt,
        }).from(instances);

        return { servers };
    } catch (e) {
        return;
    }
};