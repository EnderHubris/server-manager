# Minecraft Server Manager (Svelte)
This Svelte Application is designed to provide a simple to use interface to allow
quick and simple management of Minecraft Bedrock Servers.

I created the asset images through MS-Paint, I figured a bad simple logo would
be nice to add more graphic content to the pages.

## Notice
This application was not intented to be used over public internet, web vulnerabilities are
very easy to introduce and patching all vectors is near impossible as code is never secure.

The default credential is `admin:admin`, if you plan to allow access to this interface
over public internet, it is `EXTREMELY` recommended that you change the default password
to a secure and strong passphrase avoid incidents.

## Running Application
For this application to work add your user to the `docker` and `www-data` group.
```console
sudo usermod -aG docker USER
sudo usermod -aG www-data USER
```
Starting the app container, always use strong credentials.
```console
HOST_VOL="$(pwd)/local_storage" DB_USER_PASSWORD='' DB_USER='' APP_HOST="$(hostname -I | awk '{print $1}')" APP_PORT=3000 docker compose -p server_manager up --build -d
```

## Developer Section
Managing [Drizzle ORM](https://orm.drizzle.team/docs/kit-overview)
```ts
import { defineConfig } from "drizzle-kit";

// .env file read testing
console.log(process.env.DB_HOST!);
console.log(process.env.DB_USER!);
console.log(process.env.DB_DATABASE!);

export default defineConfig({
  schema: "./src/lib/database/my-schema.ts",
  out: "./drizzle",
  dialect: "...", // supports: postgresql, mysql, sqlite, mssql --> https://orm.drizzle.team/docs/drizzle-config-file#dialect
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_DATABASE!
  }
});
```

Preparing a .sql file based on a `drizzle.config.ts` config file
```console
npx drizzle-kit generate
```

Running the website in developer mode
```console
npm run dev -- --open
```

Loading prepared .sql file to initialize Docker MySQL DB
```console
mysql -h 127.0.0.1 -u DBU -p -D management < file.sql
```