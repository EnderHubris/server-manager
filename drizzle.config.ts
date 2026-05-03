import { defineConfig } from "drizzle-kit";

// .env file read testing
console.log(process.env.DB_HOST!);
console.log(process.env.DB_USER!);
console.log(process.env.DB_DATABASE!);

export default defineConfig({
  schema: "./src/lib/database/app-schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_DATABASE!
  }
});