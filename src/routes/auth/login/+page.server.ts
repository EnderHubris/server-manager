import { redirect, fail } from '@sveltejs/kit';

import { db } from '$lib/database/db';
import { sessions, users } from '$lib/database/app-schema';
import { eq } from 'drizzle-orm';

import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export const load = async ({ cookies }) => {
    const sessionId = cookies.get('session_id');
    if (!sessionId) return;

    const session = await db
        .select()
        .from(sessions)
        .innerJoin(users, eq(sessions.uid, users.id))
        .where(eq(sessions.id, sessionId))
        .limit(1);

    if (!session.length) return;
    throw redirect(301, "/dashboard");
};

export const actions = {
    // special form named-target
	login: async ({ cookies, request, getClientAddress }) => {
        const form = await request.formData();
        let formData = Object.fromEntries(form.entries()) as Record<string, string>;

        try {
            const username = formData.username;
            const password = formData.password;

            const pwdHash = await bcrypt.hash(password, 10);
            console.log(`[*] Password Hash - ${pwdHash}`);

            const ip = getClientAddress();

            const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
            if (!user || !(await bcrypt.compare(password, user.password))) {
                console.error("[ERROR] Invalid username or password");
                return { success: false, message: 'Invalid username or password' };
            }

            // generate a new session
            const sessionId = randomBytes(32).toString('hex');

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);
            
            await db.insert(sessions).values({
                id: sessionId,
                uid: user.id,
                ip: ip,
                expiresAt: expiresAt,
            });

            cookies.set('session_id', sessionId, {
                path: '/',
                httpOnly: true, // prevent XSS
                secure: true,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30   // 30 days
            });

            throw redirect(301, "/dashboard");
        } catch (e) {
            console.error(`[ERROR] -- ${e}`);
            return { success: false, message: 'An error occurred' };
        }
    },
};