export const RESERVATION_EVENTS = {
  RESERVATION_CREATED: 'reservation.created',
  BOOKING_FAILED: 'booking.failed',
} as const;

export const PAYMENT_EVENTS = {
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
  REFUND_SUCCEEDED: 'refund.succeeded',
  REFUND_FAILED: 'refund.failed',
} as const;

export const TICKET_EVENTS = {
  TICKET_ISSUED: 'ticket.issued',
  TICKET_ISSUANCE_FAILED: 'ticket.issuance_failed',
} as const;

export const EVENTS = {
  ...RESERVATION_EVENTS,
  ...PAYMENT_EVENTS,
  ...TICKET_EVENTS,
} as const;

export type ReservationEventName =
  (typeof RESERVATION_EVENTS)[keyof typeof RESERVATION_EVENTS];
export type PaymentEventName =
  (typeof PAYMENT_EVENTS)[keyof typeof PAYMENT_EVENTS];
export type TicketEventName =
  (typeof TICKET_EVENTS)[keyof typeof TICKET_EVENTS];

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
