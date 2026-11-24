import type { EventName } from './event-names.js';
import type { EventPayloads } from './event-payloads.js';

export type Envelope<E extends EventName = EventName> = {
  event_id: string;
  event_type: E;
  version: number;
  created_at: string;
  payload: EventPayloads[E];
  correlation_id: string;
};

export type AnyEnvelope = { [E in EventName]: Envelope<E> }[EventName];
