import * as tar from 'tar'
import unzipper from 'unzipper';

import fs from 'fs/promises';
import { createReadStream } from 'fs';

import { basename, join } from 'path';

import { fileExists, parseConf, type ConfigData } from '$lib/conf/config';

// List of files/folders to be preserved on updates
const preserve_list = [
    "allowlist.json",
    "permissions.json",
    "server.properties",
    "worlds"
];

/**
 * Generate a tar.gz backup file of a given server, original server files are NOT MODIFIED
 * 
 * @param server_name 
 * @returns 
 */
export async function backup_server(server_name: string): Promise<string|undefined> {
    const conf: ConfigData = await parseConf();
    if (!conf) {
        console.error("[-] Error reading config file!");
        return;
    }

    try {
        const server_location = join(
            conf.server_root,
            server_name
        );

        const right_now: Date = new Date();
        const dd    = String(right_now.getDate()).padStart(2, '0');
        const mm    = String(right_now.getMonth() + 1).padStart(2, '0');
        const yyyy  = right_now.getFullYear();
        const hh    = String(right_now.getHours()).padStart(2, '0');
        const min   = String(right_now.getMinutes()).padStart(2, '0');
        const ss    = String(right_now.getSeconds()).padStart(2, '0');

        const archive_date = `${dd}${mm}${yyyy}-${hh}${min}${ss}`;
        const archive_name = `${server_name}-${archive_date}-backup.tar.gz`;
        const archive_file = join(conf.server_root, archive_name);
        
        // create a new server backup
        await tar.create({
            gzip: true,
            file: archive_file,
            cwd: server_location,
        }, preserve_list);

        console.log(`[+] Created Backup: ${archive_file}`);
        return archive_file;
    } catch (e) {
        console.error("[-] Error:", e);
        return;
    }
}

/**
 * Unzips a zip archive into a specific directory
 * 
 * @param zipPath 
 * @param outDir 
 */
async function unzip(zipPath: string, outDir: string): Promise<boolean> {
    if (!await fileExists(outDir)) {
        console.error("[-] ZIP output directory does not exist!");
        return false;
    }

    try {
        await new Promise<void>((resolve, reject) => {
            createReadStream(zipPath)
                .pipe(unzipper.Extract({ path: outDir }))
                .on('close', resolve)
                .on('error', reject);
        });

        console.log(`[+] Extracted to: ${outDir}`);
        return true;
    } catch (e) {
        console.error(`[-] Unzip failed: ${e}`);
        return false;
    }
}

/**
 * Perform a recursive rm operation at a given location
 * if the folder is fully removed it is recreated
 * 
 * @param server_location 
 */
async function clearServerFolder(server_location: string): Promise<boolean> {
    try {
        // remove the targeted folder
        await fs.rm(server_location, { recursive: true });

        // incase it is fully removed create a new empty folder
        await fs.mkdir(server_location, { recursive: true });

        return true;
    } catch (e) {
        console.error("[-] Error:", e);
        return false;
    }
}

/**
 * Saves provided software zip achive onto disk and returns saved path
 * 
 * @param server_software 
 * @param softwareUploadPath 
 */
async function saveServerSoftware(server_software: File, softwareUploadPath: string): Promise<string|undefined> {
    try {
        const safeSoftwareName = basename(server_software.name);
    
        await fs.mkdir(softwareUploadPath, { recursive: true });
        console.log(`[+] Software Upload Path: '${softwareUploadPath}' exists!`);
    
        const softwarePath = join(softwareUploadPath, safeSoftwareName);
        if (!await fileExists(softwarePath)) {
            await fs.writeFile(softwarePath, Buffer.from(await server_software.arrayBuffer()));
            console.log(`[+] Software Saved: '${softwarePath}'`);
        } else {
            // instead of rewriting on disk, we can just use the zip thats
            // already on disk for efficiency
            console.log(`[+] Software Found: '${softwarePath}'`);
        }
    
        return softwarePath;
    } catch (e) {
        console.error("[-] Error:", e);
        return;
    }
}

/**
 * Remove newly inserted files from the software archive
 * and replace them with the backed-up files
 * 
 * @param server_location 
 * @param backup_file 
 * @returns 
 */
async function replaceFiles(server_location: string, backup_file: string): Promise<boolean> {
    // check if arguments exist in the file-system
    if (!fileExists(server_location)) {
        console.error("[-] server folder does not exist");
        return false;
    }

    if (!fileExists(backup_file)) {
        console.error("[-] Backup file does not exist");
        return false;
    }

    try {
        // file removal stage
        console.log("[*] Removing place-holder files");
        for (const file of preserve_list) {
            const fp = join(server_location, file);
            if (await fileExists(fp)) {
                await fs.rm(fp, { recursive:true });
            }
        }
        console.log("[+] Place-holder files removed successfully!");

        // extract tar.gz
        console.log("[*] Attempting to extract backup files");
        await tar.x({
            file: backup_file,
            cwd: server_location
        }).then(() => { console.log("[+] Successfully reinserted tar-data!"); });
        
        return true;
    } catch (e) {
        console.error("[-] Error:", e);
        return false;
    }
}

/**
 * Saves the server software archive on disk, removes server files from server folder,
 * decompresses software zip file into server folder, replaces new files for
 * preserved backup files and returns true if full operation was successful
 * 
 * @param server_name 
 * @param backup_file 
 * @param server_software 
 * @returns 
 */
export async function install_server(
    server_name: string,
    backup_file: string,
    server_software: File
): Promise<boolean> {
    const conf: ConfigData = await parseConf();
    if (!conf) {
        console.error("[-] Error reading config file!");
        return false;
    }

    try {
        console.log("[*] Attempting to update server files");

        const softwareUploadPath = join(conf.server_root, "software");
        const softwarePath = await saveServerSoftware(server_software, softwareUploadPath);
        if (!softwarePath) {
            console.error("[-] Error saving server software!");
            return false;
        }

        // check if server files were backed up before removing files from disk
        if (!fileExists(backup_file)) {
            console.warn("[*] Refusing to modify current server file contents until a (.tar.gz) backup exists!");
            return false;
        }

        // clear old server data
        const server_location = join(
            conf.server_root,
            server_name
        );
        console.log("[*] Clearing old server folder");
        if (!await clearServerFolder(server_location)) {

        }
        console.log("[+] Cleared successfully!");

        // unzip server software zip archive into server_location
        console.log("[*] Decompressing server software");
        if (!await unzip(softwarePath, server_location)) {

        }
        console.log("[*] Decompressed successfully!");

        // remove newly installed files and replace them with .tar.gz
        // backup files
        console.log("[*] Extracting backup files into server folder");
        return await replaceFiles(server_location, backup_file);
    } catch (e) {
        console.error("[-] Error:", e);
        return false;
    }
}