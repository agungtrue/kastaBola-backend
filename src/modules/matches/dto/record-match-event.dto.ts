import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsInt,
  IsUUID,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import {
  MatchEventType,
  CardType,
  TeamSide,
} from '../../../common/enums/identity.enum.js';

export class RecordMatchEventDto {
  @IsString()
  @IsNotEmpty({ message: 'refereeToken wajib diisi' })
  refereeToken: string;

  @IsEnum(TeamSide, { message: 'teamSide harus berupa HOME atau AWAY' })
  teamSide: TeamSide;

  @IsInt()
  @Min(1)
  @Max(120)
  minute: number;

  @IsEnum(MatchEventType, { message: 'type harus berupa GOAL atau CARD' })
  type: MatchEventType;

  @IsEnum(CardType, { message: 'cardType harus berupa YELLOW atau RED' })
  @IsOptional()
  cardType?: CardType;

  @IsUUID('4', { message: 'scorerPlayerId harus berupa UUID v4' })
  @IsOptional()
  scorerPlayerId?: string;

  @IsUUID('4', { message: 'assistPlayerId harus berupa UUID v4' })
  @IsOptional()
  assistPlayerId?: string;

  @IsUUID('4', { message: 'targetPlayerId harus berupa UUID v4' })
  @IsOptional()
  targetPlayerId?: string;
}