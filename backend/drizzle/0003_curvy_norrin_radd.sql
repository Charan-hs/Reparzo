CREATE TABLE `service_hubs` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`area` text NOT NULL,
	`city` text DEFAULT 'Bengaluru' NOT NULL,
	`pincode` text NOT NULL,
	`full_address` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`radius_km` real DEFAULT 8 NOT NULL,
	`base_eta_minutes` integer DEFAULT 15 NOT NULL,
	`per_km_eta_minutes` real DEFAULT 2 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `service_hubs_code_unique` ON `service_hubs` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_service_hubs_code` ON `service_hubs` (`code`);--> statement-breakpoint
CREATE INDEX `idx_service_hubs_active_order` ON `service_hubs` (`is_active`,`display_order`);--> statement-breakpoint
CREATE TABLE `user_addresses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`label` text DEFAULT 'Home' NOT NULL,
	`full_address` text NOT NULL,
	`flat_number` text,
	`landmark` text,
	`area` text NOT NULL,
	`city` text DEFAULT 'Bengaluru' NOT NULL,
	`pincode` text NOT NULL,
	`latitude` real,
	`longitude` real,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_user_addresses_user_id` ON `user_addresses` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_user_addresses_default` ON `user_addresses` (`is_default`);