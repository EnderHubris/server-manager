import { eq } from 'drizzle-orm';
import { db } from '$lib/database/db';

import { users,instances } from '$lib/database/app-schema';
import { IsAuthenticated } from '$lib/database/auth';

import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import { join } from 'path';

import { UploadIcon } from '$lib/operations/upload_file.js';
import { startServer, stopServer, removeData } from '$lib/operations/instance_manager.js';
import { backup_server } from '$lib/operations/update_server.js';

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

async function deleteServer(name: string) : Promise<Response> {
    console.log(`[DELETION] Attempting to remove server: ${name}`);
    try {
        // stop active container in order to safely backup server files
        if (!await stopServer(name)) {
            return json({ success: false, error: 'Failed to stop server!' });
        }

        // backup server files
        const backup_file = await backup_server(name);
        if (!backup_file) {
            return json({ success: false, error: 'Failed to backup server!' });
        }

        // delete server volume
        if (!await removeData(name)) {
            return json({ success: false, error: 'Failed to remove server volume!' });
        }

        // remove icon file
        const [data] = await db.select({ icon: instances.icon })
                    .from(instances)
                    .where(eq(instances.name, name)).limit(1);

        if (data.icon.length > 0) {
            const abs_path = join(process.cwd(), data.icon);
            await fs.rm(abs_path);
        }

        // remove entry
        const result = await db.delete(instances)
                    .where(eq(instances.name, name)).limit(1);
        if (!result.length)
            return json({ success: false, error: `${name} does not exist` , status: 200 });

        console.log(`[DELETION] Removed server: ${name}`);
        return json({ success: true, message: `${name} removed successfully!` , status: 200 });
    } catch (e) {
        return json({ success: false, error: 'Error Occurred' , status: 500 });
    }
}

async function toggleServer(name: string, o_status: boolean) {
    console.log(`[TOGGLE_SERVER] Attempting to ${ o_status ? "enable" : "disable" } server: ${name}`);
    try {
        const docker_o_status = o_status ? await startServer(name) : await stopServer(name);
        if (!docker_o_status){
            return json({ success: false, error: `Error occurred toggling: ${name}` , status: 200 });
        }

        // update instance online status in the DB
        const result = await db.update(instances)
                            .set({ online: o_status })
                            .where(eq(instances.name, name)).limit(1);
        if (!result.length) {
            return json({ success: false, error: `${name} does not exist` , status: 200 });
        }

        console.log(`[TOGGLE_SERVER] Toggled server: ${name}`);
        return json({ success: true, message: `${name} instance ${ o_status ? "enabled" : "disabled" }!` , status: 200 });
    } catch (e) {
        return json({ success: false, error: 'Error Occurred' , status: 500 });
    }
}

async function updateIcon(server_name: string, icon: File): Promise<boolean> {
    try {
        const newIcon = await UploadIcon(icon);
        if (!newIcon.length) {
            console.error("[-] Error uploading new icon");
            return false;
        }

        const result = await db.update(instances)
                        .set({ icon: newIcon })
                        .where(eq(instances.name, server_name)).limit(1);

        if (!result.length) {
            console.error("[-] Error updating new icon entry");
            return false;
        }

        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Change a given servers description text
 * 
 * @param server_name 
 * @param description 
 * @returns 
 */
async function updateDescription(server_name: string, description: string): Promise<boolean> {
    try {
        const result = await db.update(instances)
                        .set({ description: description })
                        .where(eq(instances.name, server_name)).limit(1);

        if (!result.length) {
            console.error("[-] Error updating server description");
            return false;
        }

        return true;
    } catch (e) {
        return false;
    }
}

export const POST = async ( event ) => {
    const sessionId = event.cookies.get('session_id') as string;
    
    // verify authentication
    const auth = await IsAuthenticated(sessionId);
    if (!auth.success)
        return json({ success: false, error: 'Unauthorized' , status: 401 });
    if (!auth.user)
        return json({ success: false, error: 'Error Occurred' , status: 500 });
    
    if (auth.user.role !== "admin")
        return json({ success: false, error: 'Must be an Admin' , status: 401 });
    
    
    const contentType = event.request.headers.get('content-type') ?? '';
    if (contentType.includes('multipart/form-data')) {
        const formData = await event.request.formData();

        const action      = formData.get('action') as string;
        const server_name = formData.get('server_name') as string;
        const icon        = formData.get('icon') as File;

        console.log(action, server_name, icon.name);

        if (action === "change-icon") {
            const result = await updateIcon(server_name, icon);
            if (result) {
                return json({ success: true, message: "Icon Updated", status: 200 });
            } else {
                return json({ success: false, error: "Failed to update icon" , status: 200 });
            }
        }
    } else {
        const data = await event.request.json();
    
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

            return await deleteServer(data.server_name);
        } else if (action === "toggle-server") {
            // { action: 'toggle-server', server_name, o_status }
            if (!data.server_name)
                return json({ success: false, error: 'Invalid Data' , status: 400 });
            if (data.o_status === undefined)
                return json({ success: false, error: 'Invalid Data' , status: 400 });

            return await toggleServer(data.server_name, data.o_status);
        } else if (action === "update-desc") {
            // { action: 'update-desc', server_name, description }
            if (!data.server_name)
                return json({ success: false, error: 'Invalid Data' , status: 400 });
            if (!data.description)
                return json({ success: false, error: 'Invalid Data' , status: 400 });

            if (await updateDescription(data.server_name, data.description)) {
                return json({ success: true, message: "Description Updated", status: 200 });
            } else {
                return json({ success: false, error: "Failed to update description" , status: 200 });
            }
        }
    }

    return json({ success: false, error: 'Error Occurred' , status: 500 });
};