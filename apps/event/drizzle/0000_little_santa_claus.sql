CREATE TYPE "public"."event_seat_status" AS ENUM('AVAILABLE', 'HELD', 'BOOKED');--> statement-breakpoint
CREATE TABLE "event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"venue_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_event_id_venue" UNIQUE("id","venue_id"),
	CONSTRAINT "ck_event_ends_after_starts" CHECK ("event"."ends_at" > "event"."starts_at")
);
--> statement-breakpoint
CREATE TABLE "event_seat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"seat_id" uuid NOT NULL,
	"venue_id" uuid NOT NULL,
	"price" integer NOT NULL,
	"status" "event_seat_status" DEFAULT 'AVAILABLE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_event_seat_per_event" UNIQUE("event_id","seat_id"),
	CONSTRAINT "ck_event_seat_price_positive" CHECK ("event_seat"."price" > 0)
);
--> statement-breakpoint
CREATE TABLE "inbox_event" (
	"event_id" uuid PRIMARY KEY NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venue_id" uuid NOT NULL,
	"section" varchar(50) NOT NULL,
	"row" varchar(10) NOT NULL,
	"seat_number" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_seat_position" UNIQUE("venue_id","section","row","seat_number"),
	CONSTRAINT "uq_seat_id_venue" UNIQUE("id","venue_id")
);
--> statement-breakpoint
CREATE TABLE "venue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_venue_id_venue_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venue"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_seat" ADD CONSTRAINT "fk_event_seat_event_venue" FOREIGN KEY ("event_id","venue_id") REFERENCES "public"."event"("id","venue_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_seat" ADD CONSTRAINT "fk_event_seat_seat_venue" FOREIGN KEY ("seat_id","venue_id") REFERENCES "public"."seat"("id","venue_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seat" ADD CONSTRAINT "seat_venue_id_venue_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venue"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_event_starts_at" ON "event" USING btree ("starts_at");