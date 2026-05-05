import fs from 'fs/promises';
import { env } from "$env/dynamic/private";

export interface ConfigData {
    server_root: string
};
export const defaultConfig: ConfigData = {
    "server_root":`${process.cwd()}/servers`
};

async function fileExists(path: string): Promise<boolean> {
    try {
        await fs.access(path, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

/**
 * test if conf file exists, and creates a default conf file
 * if one does not exist based on env.CONF_FILE path string
 */
async function creatConfFile() {
    try {
        const confFile = env.CONF_FILE;
        if (confFile) {
            // check if the file exists before creating a new file
            if (!await fileExists(confFile)) {
                console.log("[+] Creating new config file at:", confFile);
                await fs.writeFile(confFile, JSON.stringify(defaultConfig));
            }
            return true;
        } else {
            console.error("[-] Missing CONF_FILE in .env");
            return false;
        }
    } catch (e) {
        console.error("[-] Error:", e);
        return false;
    }
}

/**
 * return current configuration as a JSON object
 * 
 * @returns 
 */
export async function parseConf(): Promise<any|undefined> {
    const confFile = env.CONF_FILE;
    try {
        if (confFile) {
            await creatConfFile();

            const conf_str = await fs.readFile(confFile, { encoding: 'utf8' });
            return JSON.parse(conf_str);
        } else {
            console.error("[-] Missing CONF_FILE in .env");
            return;
        }
    } catch (e) {
        console.error("[-] Error:", e);
        return false;
    }
}

/**
 * Update configuration based on a JSON string
 * 
 * @param conf_str 
 */
export async function updateConf(conf_str: string) {
    try {
        const conf_n = JSON.parse(conf_str);
        let conf_o = await parseConf();
        if (!conf_o) return false;
    
        console.log("[*] Modifying conf entries");
        // iterate over the JSON object and update conf entries
        for (const [key, value] of Object.entries(conf_n)) {
            conf_o[key] = value;
        }
    
        // write changes to conf file
        const confFile = env.CONF_FILE;
        if (confFile) {
            await creatConfFile();

            console.log("[*] Writing Changes to conf file");
            await fs.writeFile(confFile, JSON.stringify(conf_o));
            return true;
        } else {
            console.error("[-] Missing CONF_FILE in .env");
            return false;
        }
    } catch (e) {
        console.error("[-] Error:", e);
        return false;
    }
}