import {
    mysqlTable, int, varchar, timestamp,
    text
} from "drizzle-orm/mysql-core";
import { randomBytes } from "crypto";

export const users = mysqlTable("users", {
  id:        int('id').primaryKey().autoincrement(),
  username:  varchar("username", { length: 24 }).notNull().unique(),
  password:  varchar("password", { length: 256 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  role:      varchar("role", { length: 12 }).default("user")
});

export const sessions = mysqlTable("sessions", {
  id:        varchar('id', { length: 64 }).primaryKey().$defaultFn(() => randomBytes(32).toString("hex")),
                                                            // cascade allows db admin
                                                            // to remove a user from
                                                            // the users table and recursively
                                                            // remove all their associated
                                                            // sessions
  uid:       int('uid').notNull().references(() => users.id, { onDelete: "cascade" }),
  ip:        varchar("ip", { length: 18 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const instances = mysqlTable("instances", {
  id:           int('id').primaryKey().autoincrement(),
  name:         varchar("name", { length: 24 }).notNull().unique(),
  description:  text("desc").notNull().default(""),
  icon:         varchar('icon', { length: 64 }).notNull().default(""),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
});