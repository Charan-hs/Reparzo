CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'USER' NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`phone` text,
	`metadata` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_role_status` ON `users` (`role`,`status`);--> statement-breakpoint
CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`price_estimated` real NOT NULL,
	`duration_minutes` integer DEFAULT 60 NOT NULL,
	`icon` text DEFAULT 'Wrench' NOT NULL,
	`is_popular` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`metadata` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `services_slug_unique` ON `services` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_services_category_active` ON `services` (`category`,`is_active`);--> statement-breakpoint
CREATE INDEX `idx_services_slug` ON `services` (`slug`);--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`service_id` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`customer_phone` text NOT NULL,
	`address` text NOT NULL,
	`city` text DEFAULT 'Bangalore' NOT NULL,
	`pincode` text NOT NULL,
	`issue_description` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`scheduled_at` integer NOT NULL,
	`completed_at` integer,
	`total_amount` real,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `idx_bookings_user_status` ON `bookings` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_bookings_status_scheduled` ON `bookings` (`status`,`scheduled_at`);