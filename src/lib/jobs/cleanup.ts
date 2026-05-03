import { db } from '$lib/database/db';
import { sessions } from '$lib/database/app-schema';
import { lt } from 'drizzle-orm';

/**
 * cronjob automation where daily logic occurs
 * to remove expired session rows within the DB
 */
export async function cleanExpiredSessions() {
  const deleted = await db
    .delete(sessions)
    .where(lt(sessions, new Date()));

  console.log(`[cron] Deleted ${deleted.length} expired sessions`);
}