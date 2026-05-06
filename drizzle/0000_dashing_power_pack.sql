CREATE TABLE IF NOT EXISTS `instances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(24) NOT NULL,
	`description` text NOT NULL DEFAULT (''),
	`icon` varchar(64) NOT NULL DEFAULT '',
	`online` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `instances_id` PRIMARY KEY(`id`),
	CONSTRAINT `instances_name_unique` UNIQUE(`name`)
);

CREATE TABLE IF NOT EXISTS `sessions` (
	`id` varchar(64) NOT NULL,
	`uid` int NOT NULL,
	`ip` varchar(18) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(24) NOT NULL,
	`password` varchar(256) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`role` varchar(12) NOT NULL DEFAULT 'user',
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_uid_users_id_fk` FOREIGN KEY (`uid`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;

INSERT IGNORE INTO users (username, password, role)
VALUES (
    'admin',
    '$2b$10$oBE2H80P3idjTIXs84b9heEaDtfInCeOm2aVoHBntEwV3pwBcYA22',
    'admin'
);