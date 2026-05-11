import { IsAuthenticated } from '$lib/database/auth';
import { redirect } from '@sveltejs/kit';

import { eq } from 'drizzle-orm';
import { db } from '$lib/database/db';
import { instances } from '$lib/database/app-schema.js';

import { UploadIcon } from '$lib/operations/upload_file.js';
import { createServer } from '$lib/operations/instance_manager.js';
import { ImportServer } from '$lib/operations/import_server.js';

export const load = () => {
    throw redirect(303, '/dashboard');
};

interface ServerData {
    name: string,
    port: number
    desc: string,
    icon: string
}

/**
 * Take server data and generate a server container
 * 
 * @param data 
 * @returns 
 */
async function GenerateContainer(data: ServerData) {
    try {
        console.log("[CREATE_SERVER] Validating Data");

        // try creating a new docker container for the server
        console.log("[CREATE_SERVER] Attempting to create server container");
        if (!await createServer(data.name, data.port)) {
            console.warn("Container Not Created!")
            return { success: false, error: 'Failed creating server container' };
        }

        console.log(`[CREATE_SERVER] New Instance: ${JSON.stringify(data)}`);

        await db.insert(instances)
            .values({
                name: data.name,
                server_port: String(data.port),
                description: data.desc,
                icon: data.icon,
            });

        console.log(`[CREATE_SERVER] Successfully added: ${data.name}`);

        return true;
    } catch (e: any) {
        console.log("[-] Error Creating Container:", e);
        return false;
    }
}

/**
 * Return true if a port is not taken by another instance
 * 
 * @param port 
 * @returns 
 */
async function PortAvailable(port: string): Promise<boolean> {
    const results = await db.select({ name: instances.name })
                        .from(instances)
                        .where(eq(instances.server_port, port)).limit(1);
    return results.length === 0;
}

export const actions = {
    // special form named-target
    create_server: async ({ request, cookies }) => {
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
        
        console.log("[CREATE_SERVER] Reviewing Form Data. . .");

        const form = await request.formData();

        try {
            const server_name = form.get('server_name') as string;
            const server_port = Number(form.get('server_port') as string);
            const server_description = form.get('server_description') as string;
            const server_icon = form.get('server_icon') as File;

            // check port availablilty
            if (!PortAvailable(String(server_port))) {
                return { success: false, error: 'Port Taken' };
            }

            console.log("[CREATE_SERVER] Validating Data");

            const instance_info: ServerData = {
                name: server_name,
                port: server_port,
                desc: server_description,
                icon: "", // updated later if possible
            };
            
            // server_name is required
            if (!server_name || server_name.length === 0)
                return { success: false, error: 'Invalid Data' };
            if (server_icon && server_icon.size > 0) {
                instance_info.icon = await UploadIcon(server_icon);
            }
            // check for valid port number
            if (isNaN(server_port) || server_port < 1 || server_port > 65535) {
                return { success: false, error: 'Invalid port number' };
            }

            // try creating a new docker container for the server
            if (!await GenerateContainer(instance_info)) {
                return { success: false, error: 'Error Occurred Generating Server Container' };
            }

            return { success: true, message: "Created New Server Instance" }
        } catch (e) {
            console.error(`[ERROR] -- ${e}`);
            return { success: false, error: 'An error occurred' };
        }
    },
    import_server: async ({ request, cookies }) => {
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
        
        console.log("[IMPORT_SERVER] Reviewing Form Data. . .");

        const form = await request.formData();

        try {
            const server_archive = form.get('server_import') as File;
            const server_port = Number(form.get('server_port') as string);
            const server_description = form.get('server_description') as string;

            // check port availablilty
            if (!PortAvailable(String(server_port))) {
                return { success: false, error: 'Port Taken' };
            }

            const result = await ImportServer({
                archive: server_archive,
                port: server_port,
                description: server_description
            });

            if (!result.success) {
                console.log("[-] Import Failed");
                return { success: false, error: 'Failed to Import' };
            }

            const instance_info: ServerData = {
                name: result.name,
                port: server_port,
                desc: server_description,
                icon: "",
            };
            
            // server_name is required
            if (!instance_info.name || instance_info.name.length === 0)
                return { success: false, error: 'Invalid Data' };
            // check for valid port number
            if (isNaN(server_port) || server_port < 1 || server_port > 65535) {
                return { success: false, error: 'Invalid port number' };
            }

            if (!await GenerateContainer(instance_info)) {
                return { success: false, error: 'Error Occurred Generating Server Container' };
            }

            return { success: true, message: "Imported Successfully" }
        } catch (e) {
            console.error(`[ERROR] -- ${e}`);
            return { success: false, error: 'An error occurred' };
        }
    },
};