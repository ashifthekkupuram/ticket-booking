export type PaymentSucceededPayload = {
  reservation_id: string;
  payment_id: string;
  amount: number; // Smallest Units (ex: paise, cents)
  currency: string;
};
