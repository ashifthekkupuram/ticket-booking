export type RefundFailedPayload = {
  reservation_id: string;
  payment_id: string;
  refund_id: string;
  amount: number; // Smallest Units (ex: paise, cents)
  currency: string;
  failed_at: string; // ISO 8601 UTC
  reason: string;
};
