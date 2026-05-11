import { error } from '@sveltejs/kit';

import { readFile } from 'fs/promises';
import { join, basename } from 'path';
import { BACKUP_DIR } from '$lib/operations/file_handle.js';

export const GET = async ({ params }) => {
    const safeName = basename(params.file);

    try {
        const buffer = await readFile(join(BACKUP_DIR, safeName));
        return new Response(buffer, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${safeName}"`
            }
        });
    } catch {
        throw error(404, 'File not found');
    }
};