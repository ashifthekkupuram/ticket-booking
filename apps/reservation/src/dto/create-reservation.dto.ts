import { MAX_SEATS_PER_RESERVATION } from '@app/contracts';
import {
  IsUUID,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  ArrayMaxSize,
  ArrayUnique,
  ArrayMinSize,
} from 'class-validator';

export class CreateReservationDto {
  @IsUUID('4')
  eventId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_SEATS_PER_RESERVATION)
  @ArrayUnique()
  @IsUUID('4', { each: true })
  eventSeatIds!: string[];
}
