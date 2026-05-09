import Dockerode from 'dockerode';
import { parseConf, type ConfigData } from '$lib/conf/config';

import { eq } from 'drizzle-orm';
import { db } from '$lib/database/db';
import { instances } from '$lib/database/app-schema';

import fs from 'fs/promises';
import { statSync } from 'fs';

const mc_bedrock_server = 'itzg/minecraft-bedrock-server';

// connects via socket automatically
const docker = new Dockerode({ socketPath: '/var/run/docker.sock' });

/**
 * Sleep for desired milli-seconds
 * 
 * @param ms 
 * @returns 
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if we have access to a specific image and pull it
 * if the image reference is not found
 * 
 * @param image 
 */
async function ensureImage(image: string): Promise<void> {
    try {
        await docker.getImage(image).inspect();
        console.log(`[+] Image '${image}' already exists`);
    } catch {
        console.log(`[*] Pulling image '${image}'...`);
        await new Promise<void>((resolve, reject) => {
            docker.pull(image, (err: any, stream: any) => {
                if (err) return reject(err);
                docker.modem.followProgress(stream, (err: any) => {
                    if (err) return reject(err);
                    console.log(`[+] Image '${image}' pulled successfully`);
                    resolve();
                });
            });
        });
    }
}

/**
 * Check if a server dir has www-data permissions
 * 
 * @param hostDir 
 * @returns 
 */
async function ensurePermissions(hostDir: string): Promise<boolean> {
    try {
        const stat = statSync(hostDir);
        
        console.log(`[*] Owner UID: ${stat.uid} GID: ${stat.gid}`);
    
        // www-data is typically uid 33, gid 33
        const WWW_DATA_UID = 33;
        const WWW_DATA_GID = 33;
    
        if (stat.uid !== WWW_DATA_UID || stat.gid !== WWW_DATA_GID) {
            console.log('[*] Permissions incorrect');
            return false;
        } else {
            console.log('[+] Permissions correct');
            return true;
        }
    } catch (e) {
        console.log('[*] Permissions incorrect');
        return false;
    }
}

/**
 * Execute a command on a container and wait for it to finish
 * 
 * @param container 
 * @param cmd 
 */
async function execAndWait(container: Dockerode.Container, cmd: string[]): Promise<void> {
    const exec = await container.exec({
        Cmd: cmd,
        AttachStdout: true,
        AttachStderr: true,
    });

    await new Promise<void>((resolve, reject) => {
        exec.start({ hijack: true, stdin: false }, (err: any, stream: any) => {
            if (err) return reject(err);
            stream.on('end', resolve);
            stream.on('error', reject);
        });
    });
}

/**
 * Update minecraft server docker file permissions to allow
 * the host to modify files as a non-root user
 * 
 * @param name 
 * @param hostDir 
 */
async function fixPermissions(name: string, hostDir: string): Promise<boolean> {
    try {
        const container = docker.getContainer(name);

        for (let i = 0; i < 10; ++i) {
            await execAndWait(container, ['chown', '-R', 'www-data:www-data', '/data']);
            console.log('[+] www-data ownership applied!');
    
            await execAndWait(container, ['chmod', '-R', 'g+rw', '/data']);
            console.log('[+] www-data group has r+w permission!');

            // if permissions were successfully set properly
            // do not perform exec iterations
            if (await ensurePermissions(hostDir)) {
                console.log(`[+] Fixed permissions on ${hostDir}`);
                return true;
            }

            await sleep(500);
        }

        console.log(`[-] Error fixing permissions on ${hostDir}`);
        return false;
    } catch (e: any) {
        if (e.statusCode === 304 || e.statusCode === 409) {
            console.log(`[*] Container '${name}' was already stopped`);
            return false; // already stopped is still a success
        }

        console.error("[-] Error:", e);
        return false;
    }
}

export async function startServer(name: string) {
    try {
        const container = docker.getContainer(name);
        await container.start();

        // reflect containers active status
        await db.update(instances)
            .set({ online: true })
            .where(eq(instances.name, name)).limit(1);

        return true;
    } catch (e: any) {
        if (e.statusCode === 304) {
            console.log(`[*] Container '${name}' was already started`);
            return true; // already stopped is still a success
        }

        console.error("[-] Error:", e);
        return false;
    }
}

export async function stopServer(name: string) {
    try {
        const conf: ConfigData = await parseConf();
        if (!conf) {
            console.error("[-] Error reading config file!");
            return false;
        }

        // abs path to server_root volume location on host
        const hostDir = `${conf.server_root}/${name}`;

        // prepare file system for host handling
        await fixPermissions(name, hostDir);

        const container = docker.getContainer(name);
        await container.stop();

        // reflect containers active status
        await db.update(instances)
            .set({ online: false })
            .where(eq(instances.name, name)).limit(1);

        return true;
    } catch (e: any) {
        if (e.statusCode === 304 || e.statusCode === 409) {
            console.log(`[*] Container '${name}' was already stopped`);
            return true; // already stopped is still a success
        }

        console.error("[-] Error:", e);
        return false;
    }
}

export async function createServer(name: string, port: number): Promise<boolean> {
    try {
        if (!process.env.HOST_VOL) {
            console.error("[-] HOST_VOL undefined!");
            return false;
        }

        // abs path to server_root volume location on host
        const hostDir = `${process.env.HOST_VOL}/${name}`;
        console.log(`[BINDING] New Server Files -> ${hostDir}`);

        await ensureImage(mc_bedrock_server);

        const container = await docker.createContainer({
            Image: mc_bedrock_server,
            name,
            Env: [
                'EULA=TRUE',
                `LEVEL_NAME=${name}`,
            ],
            HostConfig: {
                PortBindings: { '19132/udp': [{ HostPort: `${port}` }] },
                Binds: [`${hostDir}:/data`], // server container mounts to server folder stored on host | not a volume
            },
        });
    
        await container.start();

        // delay exec action to ensure successful start
        await sleep(2000);

        return true;
    } catch (e) {
        console.error("[-] Error:", e);
        return false;
    }
}

/**
 * Stop a container and Delete the server folder to a specific container
 * 
 * @param name 
 * @returns 
 */
export async function removeData(name: string): Promise<boolean> {
    try {
        const conf: ConfigData = await parseConf();
        if (!conf) {
            console.error("[-] Error reading config file!");
            return false;
        }
        
        // abs path to server_root volume location on host
        const serverData = `${conf.server_root}/${name}`;
        
        // ensure container is stopped
        await stopServer(name);
        
        // delete the container
        const container = docker.getContainer(name);
        await container.remove({ force: true });

        // remove the files from the file system
        await fs.rm(serverData, { recursive: true });

        console.log("[+] Deleted Server Data for:", name);
        
        return true;
    } catch (e) {
        console.error("[-] Error:", e);
        return false
    }
}