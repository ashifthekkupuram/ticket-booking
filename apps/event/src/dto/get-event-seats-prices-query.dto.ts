import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsUUID,
} from 'class-validator';

import { MAX_SEATS_PER_RESERVATION } from '@app/contracts';

export class GetEventSeatPricesQueryDto {
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value
          .split(',')
          .map((id) => id.trim())
          .filter((id) => id)
      : value,
  )
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(MAX_SEATS_PER_RESERVATION)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  ids!: string[];
}
