import { eq } from 'drizzle-orm';
import { db } from '$lib/database/db';

import { users,instances } from '$lib/database/app-schema';
import { IsAuthenticated } from '$lib/database/auth.js';

import { json } from '@sveltejs/kit';

async function deleteUser(username: string) : Promise<Response> {
    console.log(`[DELETION] Attempting to remove ${username}`);
    try {
        // prevent removing the admin superuser
        if (username === "admin")
            return json({ success: false, error: 'Cannot delete super-user' , status: 200 });

        const result = await db.delete(users)
                    .where(eq(users.username, username)).limit(1);
        if (!result.length)
            return json({ success: false, error: `${username} does not exist` , status: 200 });

        console.log(`[DELETION] Removed ${username}`);
        return json({ success: true, message: `${username} removed successfully!` , status: 200 });
    } catch (e) {
        return json({ success: false, error: 'Error Occurred' , status: 500 });
    }
}

export const POST = async ( event ) => {
    const data = await event.request.json();
    const sessionId = event.cookies.get('session_id') as string;

    // verify authentication
    const auth = await IsAuthenticated(sessionId);
    if (!auth.success)
        return json({ success: false, error: 'Unauthorized' , status: 401 });
    if (!auth.user)
        return json({ success: false, error: 'Error Occurred' , status: 500 });
    
    if (auth.user.role !== "admin")
        return json({ success: false, error: 'Must be an Admin' , status: 401 });

    console.log(data);

    const action = data.action;
    if (!action)
        return json({ success: false, error: 'Invalid Data' , status: 400 });

    if (action === "delete-user") {
        // { action: 'delete-user', username }
        if (!data.username)
            return json({ success: false, error: 'Invalid Data' , status: 400 });
        if (data.username === auth.user.username)
            return json({ success: false, error: 'Cannot self-terminate' , status: 200 });

        return await deleteUser(data.username);
    } else if (action === "delete-server") {
        // { action: 'delete-server', server_name }
        if (!data.server_name)
            return json({ success: false, error: 'Invalid Data' , status: 400 });
        return json({ success: true, warning: 'Action under Developmenet' , status: 200 });
    }

    return json({ success: false, error: 'Error Occurred' , status: 500 });
};