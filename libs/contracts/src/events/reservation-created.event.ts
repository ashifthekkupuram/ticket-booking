export type ReservationCreatedSeat = {
  event_seat_id: string;
  price: number; // Smallest Units (ex: paise, cents)
};

export type ReservationCreatedPayload = {
  reservation_id: string;
  user_id: string;
  event_id: string;
  expires_at: string; // ISO 8601 UTC
  currency: string;
  total_amount: number; // Smallest Units (ex: paise, cents)
  seats: ReservationCreatedSeat[];
};
