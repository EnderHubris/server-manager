CREATE TABLE IF NOT EXISTS `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(24) NOT NULL,
	`password` varchar(256) NOT NULL,
	`role` varchar(12) DEFAULT 'user' NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);

INSERT IGNORE INTO users (username, password, role)
VALUES (
    'admin',
    '$2b$10$oBE2H80P3idjTIXs84b9heEaDtfInCeOm2aVoHBntEwV3pwBcYA22',
    'admin'
);

CREATE TABLE IF NOT EXISTS `sessions` (
    `id` varchar(64) NOT NULL,
    `uid` int NOT NULL,
    `ip` varchar(18) NOT NULL,
    `expires_at` timestamp NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT (now()),
    PRIMARY KEY (`id`),
    CONSTRAINT `sessions_uid_users_id_fk`
        FOREIGN KEY (`uid`) REFERENCES `users`(`id`)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS `instances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(24) NOT NULL,
	`desc` text NOT NULL DEFAULT (''),
	`icon` varchar(64) NOT NULL DEFAULT '',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `instances_id` PRIMARY KEY(`id`),
	CONSTRAINT `instances_name_unique` UNIQUE(`name`)
);