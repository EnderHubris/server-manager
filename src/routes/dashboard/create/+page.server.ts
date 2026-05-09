import { IsAuthenticated } from '$lib/database/auth';
import { redirect } from '@sveltejs/kit';

import { db } from '$lib/database/db';
import { instances } from '$lib/database/app-schema.js';

import { UploadIcon } from '$lib/operations/upload_file.js';
import { createServer } from '$lib/operations/instance_manager.js';

export const load = () => {
    throw redirect(303, '/dashboard');
};

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

            console.log("[CREATE_SERVER] Validating Data");

            const instance_info = {
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
            console.log("[CREATE_SERVER] Attempting to create server container");
            if (!await createServer(server_name, instance_info.port)) {
                console.warn("Container Not Created!")
                return { success: false, error: 'Failed creating server container' };
            }

            console.log(`[CREATE_SERVER] New Instance: ${JSON.stringify(instance_info)}`);

            await db.insert(instances)
                .values({
                    name: instance_info.name,
                    server_port: String(server_port),
                    description: instance_info.desc,
                    icon: instance_info.icon,
                });

            console.log(`[CREATE_SERVER] Successfully added: ${instance_info.name}`);

            return { success: true, message: "Created New Server Instance" }
        } catch (e) {
            console.error(`[ERROR] -- ${e}`);
            return { success: false, error: 'An error occurred' };
        }
    },
};