import { IsAuthenticated } from '$lib/database/auth';
import { redirect } from '@sveltejs/kit';

import { db } from '$lib/database/db';
import { instances } from '$lib/database/app-schema.js';

import { UploadIcon } from '$lib/operations/upload_file.js';

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
            const server_description = form.get('server_description') as string;
            const server_icon = form.get('server_icon') as File;

            console.log("[CREATE_SERVER] Creating Instance:", server_name);

            const instance_info = {
                name: server_name,
                desc: server_description,
                icon: "",
            };
            
            // server_name is required
            if (!server_name || server_name.length === 0)
                return { success: false, error: 'Invalid Data' };
            if (server_icon && server_icon.size > 0) {
                instance_info.icon = await UploadIcon(server_icon);
            }

            console.log(`[CREATE_SERVER] New Instance: ${JSON.stringify(instance_info)}`);

            await db.insert(instances)
                .values({
                    name: instance_info.name,
                    description: instance_info.desc,
                    icon: instance_info.icon,
                });

            console.log(`[CREATE_SERVER] Successfully added: ${instance_info.name}`);

            return { success: true, message: "Created New Server Instance" }
        } catch (e) {
            console.error(`[ERROR] -- ${e}`);
            return { success: false, message: 'An error occurred' };
        }
    },
};