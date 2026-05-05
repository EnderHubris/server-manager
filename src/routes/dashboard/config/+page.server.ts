import { IsAuthenticated } from '$lib/database/auth';
import {
    parseConf, updateConf, defaultConfig,
        type ConfigData 
} from '$lib/conf/config';

export const load = async ({ cookies }) => {
    const sessionId = cookies.get('session_id');
    if (!sessionId) return;

    try {
        // verify authentication
        const auth = await IsAuthenticated(sessionId);
        if (!auth.success) return;
        
        const conf = await parseConf();

        return { conf };
    } catch (e) {
        return;
    }
};

export const actions = {
    // special form named-target
    update_config: async ({ request, cookies }) => {
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

        const form = await request.formData();
        let formData = Object.fromEntries(form.entries()) as Record<string, string>;

        try {
            // build conf data from form
            const form_conf: ConfigData = {
                server_root: formData.server_root || "undefined",
            };
            
            console.log("[SERVER_CONF] Checking new conf values");
            
            // only focus on key,values that ConfigData accepts
            // do not introduce new data
            const conf_n: ConfigData = defaultConfig;
            for (const key of Object.keys(defaultConfig) as (keyof ConfigData)[]) {
                if (key in conf_n) {
                    conf_n[key] = form_conf[key];
                    if (conf_n[key] === "undefined") {
                        return { success: false, message: 'Invalid data' };
                    }
                }
            }

            console.log(`[SERVER_CONF] Changing config contents`);
            await updateConf(JSON.stringify(conf_n));

            return { success: true, message: `Updated Server Folder!` }
        } catch (e) {
            console.error(`[ERROR] -- ${e}`);
            return { success: false, message: 'An error occurred' };
        }
    },
};