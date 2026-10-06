CREATE TABLE `custom_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`customer_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`customer_email` text,
	`title` text NOT NULL,
	`category_type` text NOT NULL,
	`category_title` text NOT NULL,
	`description` text NOT NULL,
	`is_delivery` integer DEFAULT false NOT NULL,
	`pickup_address` text,
	`drop_address` text,
	`service_address` text NOT NULL,
	`preferred_date` text NOT NULL,
	`preferred_time_slot` text NOT NULL,
	`urgency` text DEFAULT 'same_day' NOT NULL,
	`estimated_budget` real,
	`quoted_price` real,
	`status` text DEFAULT 'submitted' NOT NULL,
	`admin_notes` text,
	`partner_name` text,
	`partner_phone` text,
	`completion_pin` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_custom_requests_status` ON `custom_requests` (`status`);
--> statement-breakpoint
CREATE INDEX `idx_custom_requests_user_status` ON `custom_requests` (`user_id`,`status`);
--> statement-breakpoint
CREATE INDEX `idx_custom_requests_phone` ON `custom_requests` (`customer_phone`);
--> statement-breakpoint
DROP TABLE IF EXISTS `bookings`;
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`service_id` text,
	`customer_name` text NOT NULL,
	`customer_email` text,
	`customer_phone` text NOT NULL,
	`address` text NOT NULL,
	`city` text DEFAULT 'Davangere' NOT NULL,
	`pincode` text DEFAULT '577005' NOT NULL,
	`issue_description` text,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`scheduled_at` integer,
	`completed_at` integer,
	`total_amount` real,
	`items` text,
	`item_total` real,
	`platform_fee` real,
	`discount` real,
	`grand_total` real,
	`slot` text,
	`payment_method` text DEFAULT 'cash',
	`payment_status` text DEFAULT 'pending',
	`completion_pin` text,
	`technician_name` text,
	`technician_phone` text,
	`admin_notes` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_bookings_user_status` ON `bookings` (`user_id`,`status`);
--> statement-breakpoint
CREATE INDEX `idx_bookings_status` ON `bookings` (`status`);
--> statement-breakpoint
CREATE INDEX `idx_bookings_customer_phone` ON `bookings` (`customer_phone`);