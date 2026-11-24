export const BOOKING_FAILED_REASONS = {
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  TICKET_ISSUANCE_FAILED: 'TICKET_ISSUANCE_FAILED',
  PAID_AFTER_EXPIRY: 'PAID_AFTER_EXPIRY',
} as const;

export type BookingFailedReason =
  (typeof BOOKING_FAILED_REASONS)[keyof typeof BOOKING_FAILED_REASONS];

export type BookingFailedPayload = {
  reservation_id: string;
  event_seat_ids: string[];
  reason: BookingFailedReason;
};
