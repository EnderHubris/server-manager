import { IsAuthenticated } from "$lib/database/auth";
import { BACKUP_DIR } from "$lib/operations/file_handle";

import fs from 'fs/promises';
import { join } from 'path';

interface FileEntry {
    name: string;
    size: number;
    createdAt: Date;
}

/**
 * Produce a list of backup files
 * 
 * @returns 
 */
async function getBackupFiles(): Promise<FileEntry[]> {
    try {
        const files = await fs.readdir(BACKUP_DIR);

        // do not show directories
        const entries = await Promise.all(
            files.map(async (name) => {
                const stat = await fs.stat(join(BACKUP_DIR, name));
                if (!stat.isFile()) return null;
                return { name, size: stat.size, createdAt: stat.birthtime };
            })
        );

        return entries.filter(e => e !== null) as FileEntry[];
    } catch (e) {
        console.error(`[-] Failed to list files in '${BACKUP_DIR}':`, e);
        return [];
    }
}

export const load = async ({ cookies }) => {
    const sessionId = cookies.get('session_id');
    if (!sessionId) return;

    try {
        // verify authentication
        const auth = await IsAuthenticated(sessionId);
        if (!auth.success) return;
        
        const backups = await getBackupFiles();

        return { backups };
    } catch (e) {
        return;
    }
};