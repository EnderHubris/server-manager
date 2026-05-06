import { db } from '$lib/database/db';
import { sessions, users, instances } from '$lib/database/app-schema';
import { eq } from 'drizzle-orm';
import { IsAuthenticated } from '$lib/database/auth';
import { backup_server, install_server } from '$lib/operations/update_server.js';


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

/**
 * Sleep for desired milli-seconds
 * 
 * @param ms 
 * @returns 
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const actions = {
    // special form named-target
    update_server: async ({ request, cookies }) => {
        const sessionId = cookies.get('session_id');
        if (!sessionId) return { success: false, error: 'Not Authenticated' };

        // verify authentication
        const auth = await IsAuthenticated(sessionId);
        if (!auth.success)
            return { success: false, error: 'Not Authenticated' };
        if (!auth.user)
            return { success: false, error: 'Error Occurred' };
        if (auth.user.role !== "admin")
            return { success: false, error: 'Must be an Admin' };
        
        console.log("[UPDATE_SERVER] Reviewing Form Data. . .");

        const form = await request.formData();

        try {
            const server_software = form.get('server_software') as File;
            if (!server_software.size) {
                return { success: false, error: 'Invalid Data!' };
            }

            const server_name = form.get('server_name') as string;
            if (!server_name.length) {
                return { success: false, error: 'Invalid Data!' };
            }

            console.log(`[*] Archive Info -> ${server_software.name}`);

            // backup the server
            const backup_file = await backup_server(server_name);
            if (!backup_file) {
                return { success: false, error: 'Failed to backup server!' };
            }

            // install new software and insert backed-up data
            const successfully_updated = await install_server(
                server_name,
                backup_file,
                server_software
            );
            
            if (successfully_updated) {
                return { success: true, message: "Server Updated!" }
            } else {
                return { success: false, error: 'Failed installing server software!' };
            }
        } catch (e) {
            console.error(`[ERROR] -- ${e}`);
            return { success: false, message: 'An error occurred' };
        }
    },
};