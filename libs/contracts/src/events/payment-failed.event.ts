export const PAYMENT_FAILED_REASONS = {
  ATTEMPTS_EXHAUSTED: 'ATTEMPTS_EXHAUSTED',
  ABANDONED: 'ABANDONED',
} as const;

export type PaymentFailedReason =
  (typeof PAYMENT_FAILED_REASONS)[keyof typeof PAYMENT_FAILED_REASONS];

export type PaymentFailedPayload = {
  reservation_id: string;
  payment_id: string;
  reason: PaymentFailedReason;
};
