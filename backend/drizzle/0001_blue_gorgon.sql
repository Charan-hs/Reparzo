CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`icon_name` text DEFAULT 'Wrench' NOT NULL,
	`description` text NOT NULL,
	`badge` text,
	`bg_gradient` text DEFAULT 'from-blue-600 to-cyan-500' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_categories_slug` ON `categories` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_categories_active_order` ON `categories` (`is_active`,`display_order`);--> statement-breakpoint
CREATE TABLE `sub_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`category_slug` text NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`icon_name` text,
	`description` text NOT NULL,
	`badge` text,
	`starting_price` real NOT NULL,
	`original_price` real,
	`duration_minutes` integer DEFAULT 45 NOT NULL,
	`warranty_days` integer DEFAULT 30 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`features` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sub_categories_slug_unique` ON `sub_categories` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_subcategories_category_active` ON `sub_categories` (`category_id`,`is_active`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_subcategories_slug` ON `sub_categories` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_subcategories_cat_slug` ON `sub_categories` (`category_slug`);--> statement-breakpoint
DROP INDEX `idx_services_slug`;--> statement-breakpoint
ALTER TABLE `services` ADD `category_id` text REFERENCES categories(id);--> statement-breakpoint
ALTER TABLE `services` ADD `category_slug` text;--> statement-breakpoint
ALTER TABLE `services` ADD `category_title` text;--> statement-breakpoint
ALTER TABLE `services` ADD `sub_category_id` text REFERENCES sub_categories(id);--> statement-breakpoint
ALTER TABLE `services` ADD `sub_category_slug` text;--> statement-breakpoint
ALTER TABLE `services` ADD `sub_category_title` text;--> statement-breakpoint
ALTER TABLE `services` ADD `original_price` real;--> statement-breakpoint
ALTER TABLE `services` ADD `rating` real DEFAULT 4.9 NOT NULL;--> statement-breakpoint
ALTER TABLE `services` ADD `reviews_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `services` ADD `inclusions` text;--> statement-breakpoint
ALTER TABLE `services` ADD `warranty_days` integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE `services` ADD `image` text DEFAULT '/banners/ac-service.jpg' NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_services_cat_slug` ON `services` (`category_slug`);--> statement-breakpoint
CREATE INDEX `idx_services_subcat_slug` ON `services` (`sub_category_slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_services_slug` ON `services` (`slug`);