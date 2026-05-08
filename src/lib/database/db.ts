import mysql from "mysql2/promise";

import { drizzle } from "drizzle-orm/mysql2";

// used to dynamically read .env
import { env } from "$env/dynamic/private";

const pool = mysql.createPool({
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    ssl: undefined,
    connectionLimit: 10
});

export const db = drizzle(pool);