import { writeFile, mkdir } from "fs/promises";
import { join, extname } from 'path';
import { createHash } from 'crypto';

/**
 * Upload a given icon file to disk and return the uploaded filename
 * 
 * @param file 
 * @returns 
 */
export async function UploadIcon(file: File): Promise<string> {
    try {
        const uploadDir = join(process.cwd(), "uploads");
    
        console.log(`[*] Saving Icon to: ${uploadDir}`);
        await mkdir(uploadDir, { recursive: true });
    
        const buffer = Buffer.from(await file.arrayBuffer());
        const hash = createHash('sha256').update(buffer).digest('hex');
        const ext = extname(file.name);
        const hashedName = `${hash.slice(0,8)}${ext}`;
    
        const iconPath = join(uploadDir, hashedName);
        await writeFile(iconPath, buffer);
        return join("uploads", hashedName);
    } catch (e) {
        console.error(`[-] Upload Error: ${e}`);
        return "";
    }
}