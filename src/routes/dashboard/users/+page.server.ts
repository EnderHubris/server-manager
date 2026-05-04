import { eq } from 'drizzle-orm';
import { db } from '$lib/database/db';

import { users } from '$lib/database/app-schema';
import { IsAuthenticated } from '$lib/database/auth.js';

import bcrypt from 'bcryptjs';

export const load = async ({ cookies }) => {
    const sessionId = cookies.get('session_id');
    if (!sessionId) return;

    try {
        // verify authentication
        const auth = await IsAuthenticated(sessionId);
        if (!auth.success) return;
        
        // fetch allowed operators
        const operators = await db.select({
            username: users.username,
            role: users.role,
            createdAt: users.createdAt,
        }).from(users);

        // extract username from validated session
        const username = auth.user?.username;

        return { operators, username };
    } catch (e) {
        return;
    }
};

export const actions = {
    // special form named-target
    update_passwd: async ({ request, cookies }) => {
        const sessionId = cookies.get('session_id');
        if (!sessionId) return { success: false, error: 'Not Authenticated' };

        // verify authentication
        const auth = await IsAuthenticated(sessionId);
        if (!auth.success)
            return { success: false, error: 'Not Authenticated' };

        const form = await request.formData();
        let formData = Object.fromEntries(form.entries()) as Record<string, string>;

        try {
            const username = formData.username;
            const oldpasswd = formData.oldpasswd;
            const newpasswd = formData.newpasswd;

            if (oldpasswd === newpasswd)
                return { success: false, error: 'New password cannot be the same as the old' };

            // test old password and if correct update to new password
            const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
            if (!user || !(await bcrypt.compare(oldpasswd, user.password))) {
                console.error("[ERROR] Failed password update attempt");
                return { success: false, error: 'Invalid password' };
            }

            const n_pwd_hash = await bcrypt.hash(newpasswd, 10);
            await db.update(users)
                .set({ password: n_pwd_hash })
                .where(eq(users.username, username));

            console.log(`[UPDATE-USER] ${username}:***** -> *********`);
            return { success: true, message: 'Password Updated!' }
        } catch (e) {
            console.error(`[ERROR] -- ${e}`);
            return { success: false, error: 'An error occurred' };
        }
    },
    add_user: async ({ request, cookies }) => {
        const sessionId = cookies.get('session_id');
        if (!sessionId) return { success: false, error: 'Not Authenticated' };

        // verify authentication
        const auth = await IsAuthenticated(sessionId);
        if (!auth.success)
            return { success: false, error: 'Not Authenticated' };
        if (!auth.user)
            return { success: false, error: 'Error Occurred' };
        if (auth.user.role !== "admin")
            return { success: false, error: 'Must be an Admin' };

        const form = await request.formData();
        let formData = Object.fromEntries(form.entries()) as Record<string, string>;

        try {
            const username = formData.username;
            const passwd = formData.password;
            const role = formData.role;

            const passwdHash = await bcrypt.hash(passwd, 10);

            if (!username || username.length === 0)
                return { success: false, error: 'Invalid Data' };
            if (!passwd || passwd.length === 0)
                return { success: false, error: 'Invalid Data' };
            if (!role || (role !== "admin" && role !== "user"))
                return { success: false, error: 'Invalid Data' };

            console.log(`[ATTEMPTING-NEW-USER] ${username}:${role}`);

            await db.insert(users)
                .values({
                    username: username,
                    password: passwdHash,
                    role: role
                });

            console.log(`[ADDED-USER] ${username}:${role}`);
            return { success: true, message: `${username} added!` }
        } catch (e) {
            console.error(`[ERROR] -- ${e}`);
            return { success: false, message: 'An error occurred' };
        }
    },
};