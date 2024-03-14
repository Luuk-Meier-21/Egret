CREATE TABLE `documents` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE TABLE `keywords` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`slug` text
);
--> statement-breakpoint
CREATE TABLE `keywords_to_documents` (
	`user_id` integer NOT NULL,
	`group_id` integer NOT NULL,
	PRIMARY KEY(`group_id`, `user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `keywords`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`group_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `documents_id_unique` ON `documents` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `keywords_id_unique` ON `keywords` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `keywords_slug_unique` ON `keywords` (`slug`);