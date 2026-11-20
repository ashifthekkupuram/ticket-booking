import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsUUID,
} from 'class-validator';

export class GetEventSeatPriceQueryDto {
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.split(',').map((id) => id.trim())
      : undefined,
  )
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(5)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  ids!: string[];
}
