import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type SeatPrice = {
  eventSeatId: string;
  price: number;
  eventId: string;
};

const TIMEOUT_MS = 3000;

@Injectable()
export class EventClient {
  private readonly baseUrl: string;

  constructor(config: ConfigService) {
    this.baseUrl = config.getOrThrow<string>('EVENT_SERVICE_URL');
  }

  async getSeatPrices(eventSeatIds: string[]) {
    const url = `${this.baseUrl}/event-seats/prices?ids=${eventSeatIds.join(',')}`;

    let response: Awaited<ReturnType<typeof fetch>>;
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    } catch (error) {
      throw new ServiceUnavailableException('Event service is unavailable');
    }

    if (response.status === 404) {
      throw new NotFoundException('One or more seats do not exist');
    }

    if (response.status === 404) {
      throw new BadRequestException('Invalid seat selection');
    }

    if (!response.ok) {
      throw new ServiceUnavailableException('Event service is unavailable');
    }

    try {
      const body = (await response.json()) as { seatPrices: SeatPrice[] };
      return body.seatPrices;
    } catch (error) {
      throw new ServiceUnavailableException('Event service is unavailable');
    }
  }
}
