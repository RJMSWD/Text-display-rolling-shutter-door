CREATE TABLE `field_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_hash` text NOT NULL,
	`name` text NOT NULL,
	`country` text NOT NULL,
	`message` text NOT NULL,
	`created_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE INDEX `notes_timeline` ON `field_notes` (`created_at`,`id`);--> statement-breakpoint
CREATE INDEX `notes_country_timeline` ON `field_notes` (`country`,`created_at`,`id`);--> statement-breakpoint
CREATE INDEX `notes_owner_timeline` ON `field_notes` (`owner_hash`,`created_at`);