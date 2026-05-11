import * as tar from 'tar'
import unzipper from 'unzipper';

import { join } from 'path';
import { createReadStream } from 'fs';
import { fileExists } from '$lib/conf/config';

export const BACKUP_DIR = join(process.cwd(), "backups");

/**
 * Unzips a zip archive into a specific directory
 * 
 * @param zipPath 
 * @param outDir 
 */
export async function unzip(zipPath: string, outDir: string): Promise<boolean> {
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
 * Decompress a tar.gz file into a given output directory
 * 
 * @param zipPath 
 * @param outDir 
 */
export async function tarExtract(tarPath: string, outDir: string): Promise<boolean> {
    if (!await fileExists(outDir)) {
        console.error("[-] tar output directory does not exist!");
        return false;
    }

    try {
        await tar.x({
            file: tarPath,
            cwd: outDir
        }).then(() => { console.log(`[+] Extracted to: ${outDir}`); });

        return true;
    } catch (e) {
        console.error(`[-] Tar extraction failed: ${e}`);
        return false;
    }
}