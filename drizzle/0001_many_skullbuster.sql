CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(24) NOT NULL,
	`password` varchar(256) NOT NULL,
	`role` varchar(12) DEFAULT 'user',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
INSERT INTO users (username, password, role)
VALUES (
    'admin',
    '$2b$10$oBE2H80P3idjTIXs84b9heEaDtfInCeOm2aVoHBntEwV3pwBcYA22',
    'admin'
);
CREATE TABLE `sessions` (
	`id` varchar(64) NOT NULL,
	`uid` int NOT NULL,
	`ip` varchar(18) NOT NULL,
    `expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_uid_users_id_fk` FOREIGN KEY (`uid`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;