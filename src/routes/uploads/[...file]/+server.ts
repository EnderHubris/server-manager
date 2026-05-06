import { readFile } from 'fs/promises';
import { join, extname, basename } from 'path';
import { error } from '@sveltejs/kit';

const mimeTypes: Record<string, string> = {
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
};

export const GET = async ({ params }) => {
    const safeName = basename(params.file);
    const ext = extname(safeName);
    const mime = mimeTypes[ext];

    if (!mime) throw error(400, 'Invalid file type');

    try {
        const buffer = await readFile(join(process.cwd(), 'uploads', safeName));
        return new Response(buffer, {
            headers: { 'Content-Type': mime }
        });
    } catch {
        throw error(404, 'File not found');
    }
};