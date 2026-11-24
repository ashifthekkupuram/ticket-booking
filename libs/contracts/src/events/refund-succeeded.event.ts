export type RefundSucceededPayload = {
  reservation_id: string;
  payment_id: string;
  refund_id: string;
  amount: number; // Smallest Units (ex: paise, cents)
  currency: string;
  completed_at: string; // ISO 8601 UTC
};
