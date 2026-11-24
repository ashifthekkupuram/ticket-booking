export const TICKET_ISSUANCE_FAILED_REASONS = {
  SNAPSHOT_MISSING: 'SNAPSHOT_MISSING',
  SEAT_ALREADY_TICKETED: 'SEAT_ALREADY_TICKETED',
} as const;

export type TicketIssuanceFailedReason =
  (typeof TICKET_ISSUANCE_FAILED_REASONS)[keyof typeof TICKET_ISSUANCE_FAILED_REASONS];

export type TicketIssuanceFailedPayload = {
  reservation_id: string;
  reason: TicketIssuanceFailedReason;
  source_event_id: string;
};
