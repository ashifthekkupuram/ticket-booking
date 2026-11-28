CREATE TYPE "public"."payment_attempt_status" AS ENUM('PENDING', 'SUCCEEDED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'SUCCEEDED', 'REFUNDED', 'FAILED', 'REFUND_REQUESTED');--> statement-breakpoint
CREATE TYPE "public"."refund_status" AS ENUM('PENDING', 'SUCCEEDED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."outbox_event_status" AS ENUM('PENDING', 'PUBLISHED', 'FAILED');--> statement-breakpoint
CREATE TABLE "payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reservation_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_payment_reservation" UNIQUE("reservation_id"),
	CONSTRAINT "uq_payment_id_amount" UNIQUE("id","amount"),
	CONSTRAINT "ck_payment_amount_positive" CHECK ("payment"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "payment_attempt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"provider_name" varchar(50),
	"provider_id" text,
	"status" "payment_attempt_status" DEFAULT 'PENDING' NOT NULL,
	"failed_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_payment_attempt_provider" UNIQUE("provider_name","provider_id"),
	CONSTRAINT "ck_payment_attempt_provider_both_or_none" CHECK (("payment_attempt"."provider_name" IS NOT NULL AND "payment_attempt"."provider_id" IS NOT NULL) OR ("payment_attempt"."provider_name" IS NULL AND "payment_attempt"."provider_id" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "refund" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) NOT NULL,
	"requested_at" timestamp with time zone NOT NULL,
	"status" "refund_status" DEFAULT 'PENDING' NOT NULL,
	"completed_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_refund_amount_positive" CHECK ("refund"."amount" > 0),
	CONSTRAINT "ck_refund_completed_at" CHECK (("refund"."status" = 'SUCCEEDED') = ("refund"."completed_at" IS NOT NULL)),
	CONSTRAINT "ck_refund_failed_at" CHECK (("refund"."status" = 'FAILED') = ("refund"."failed_at" IS NOT NULL))
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
ALTER TABLE "payment_attempt" ADD CONSTRAINT "fk_payment_attempt_payment" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refund" ADD CONSTRAINT "fk_refund_payment_amount" FOREIGN KEY ("payment_id","amount") REFERENCES "public"."payment"("id","amount") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_payment_attempt_pending_created_at" ON "payment_attempt" USING btree ("created_at") WHERE "payment_attempt"."status" = 'PENDING';--> statement-breakpoint
CREATE INDEX "idx_payment_attempt_payment_id" ON "payment_attempt" USING btree ("payment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_payment_attempt_live" ON "payment_attempt" USING btree ("payment_id") WHERE "payment_attempt"."status" IN ('PENDING','SUCCEEDED');--> statement-breakpoint
CREATE INDEX "idx_refund_payment_id" ON "refund" USING btree ("payment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_refund_active" ON "refund" USING btree ("payment_id") WHERE "refund"."status" IN ('PENDING', 'SUCCEEDED');--> statement-breakpoint
CREATE INDEX "idx_outbox_status_created_at" ON "outbox_event" USING btree ("status","created_at");