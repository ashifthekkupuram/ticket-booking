CREATE TYPE "public"."reservation_status" AS ENUM('PENDING', 'CANCELLED', 'CONFIRMED', 'FAILED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."outbox_event_status" AS ENUM('PENDING', 'PUBLISHED', 'FAILED');--> statement-breakpoint
CREATE TABLE "reservation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"status" "reservation_status" DEFAULT 'PENDING' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"idempotency_key" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_reservation_user_idempotency" UNIQUE("user_id","idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "reservation_seat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reservation_id" uuid NOT NULL,
	"event_seat_id" uuid NOT NULL,
	"status" "reservation_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outbox_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"aggregate_type" varchar(50) NOT NULL,
	"correlation_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"status" "outbox_event_status" DEFAULT 'PENDING' NOT NULL,
	"payload" jsonb NOT NULL,
	"published_at" timestamp with time zone,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inbox_event" (
	"event_id" uuid PRIMARY KEY NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reservation_seat" ADD CONSTRAINT "fk_reservation_seat_reservation" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_reservation_pending_expires_at" ON "reservation" USING btree ("expires_at") WHERE "reservation"."status" = 'PENDING';--> statement-breakpoint
CREATE INDEX "idx_reservation_seat_reservation_id" ON "reservation_seat" USING btree ("reservation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_reservation_seat_active" ON "reservation_seat" USING btree ("event_seat_id") WHERE "reservation_seat"."status" IN ('PENDING','CONFIRMED');--> statement-breakpoint
CREATE INDEX "idx_outbox_status_created_at" ON "outbox_event" USING btree ("status","created_at");