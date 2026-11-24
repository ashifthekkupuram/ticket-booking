import type { ReservationCreatedPayload } from './reservation-created.event.js';
import type { BookingFailedPayload } from './booking-failed.event.js';
import type { PaymentSucceededPayload } from './payment-succeeded.event.js';
import type { PaymentFailedPayload } from './payment-failed.event.js';
import type { TicketIssuedPayload } from './ticket-issued.event.js';
import type { TicketIssuanceFailedPayload } from './ticket-issuance-failed.event.js';
import type { RefundSucceededPayload } from './refund-succeeded.event.js';
import type { RefundFailedPayload } from './refund-failed.event.js';

export interface EventPayloads {
  'reservation.created': ReservationCreatedPayload;
  'booking.failed': BookingFailedPayload;
  'payment.succeeded': PaymentSucceededPayload;
  'payment.failed': PaymentFailedPayload;
  'ticket.issued': TicketIssuedPayload;
  'ticket.issuance_failed': TicketIssuanceFailedPayload;
  'refund.succeeded': RefundSucceededPayload;
  'refund.failed': RefundFailedPayload;
}
