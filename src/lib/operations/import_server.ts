import { writeFile, mkdir } from "fs/promises";
import { join, basename } from 'path';
import { createHash } from 'crypto';

import { env } from "$env/dynamic/private";
import { unzip, tarExtract } from './file_handle';
import { parseConf, type ConfigData } from '$lib/conf/config';

export interface ImportData {
    archive: File,
    port: Number,
    description: string
};

/**
 * Remove all extensions from an archive name
 * 
 * @param filepath 
 */
function extractFileName(filepath: string): string {
    return basename(filepath).replace(/(\.[^.]+)+$/, '');
}

async function UploadArchive(file: File): Promise<string> {
    try {
        const uploadDir = join(process.cwd(), "tmp_archives");
    
        console.log(`[*] Saving Archive to: ${uploadDir}`);
        await mkdir(uploadDir, { recursive: true });
    
        const buffer = Buffer.from(await file.arrayBuffer());
        const hash = createHash('sha256').update(buffer).digest('hex');

        // extract the full extension from the given file
        const ext = file.name.replace(/^[^.]+/, '');
        const hashedName = `${hash.slice(0,8)}${ext}`;
    
        const iconPath = join(uploadDir, hashedName);
        await writeFile(iconPath, buffer);
        return join("tmp_archives", hashedName);
    } catch (e) {
        console.error(`[-] Upload Error: ${e}`);
        return "";
    }
}

export async function ImportServer(data: ImportData): Promise<{success: boolean, name: string}> {
    try {
        const level_name = extractFileName(data.archive.name);
        console.log(`[*] Imported Server Name: ${level_name}`);

        const HOST_VOL = process.env.HOST_VOL || env.HOST_VOL

        if (!HOST_VOL) {
            console.error("[-] HOST_VOL undefined!");
            return { success: false, name: ""};
        }

        const conf: ConfigData = await parseConf();
        if (!conf) {
            console.error("[-] Error reading config file!");
            return { success: false, name: ""};
        }

        // save archive onto disk
        const archive_name = await UploadArchive(data.archive);
        const archive_path = join(process.cwd(), archive_name);

        // abs path to server_root volume location on host
        // const hostDir = `${HOST_VOL}/${level_name}`;
        const serverDest = `${conf.server_root}/${level_name}`;
        console.log(`[*] Importing files: ${serverDest}`);
        
        // creating folder to decompress archive into if we have a valid archive type
        const invalid = [data.archive].filter(f => 
            !f.name.endsWith('.tar.gz') && !f.name.endsWith('.zip')
        );

        // mkdir in docker context because we cannot necessarily write in the host
        await mkdir(serverDest, { recursive: true });

        // decompress based on type
        if (data.archive.name.endsWith('.tar.gz')) {
            console.log("[*] Extracting archive | tar.gz")
            if (!await tarExtract(archive_path, serverDest)) {
                return { success: false, name: ""};
            }
        } else if (data.archive.name.endsWith('.zip')) {
            console.log("[*] Extracting archive | zip")
            if (!await unzip(archive_path, serverDest)) {
                return { success: false, name: ""};
            }
        } else {
            console.warn("[*] Only zip and tar.gz files are accepted");
            return { success: false, name: ""};
        }

        console.log("[+] Successfully Archive Import!");

        return { success: true, name: level_name};
    } catch (e: any) {
        console.error("[-] Error:", e);
        return { success: false, name: ""};
    }
}