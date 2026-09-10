import {
  IsEnum,
  IsUUID,
  IsNotEmpty,
  IsInt,
  IsString,
  IsOptional,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { GameMode } from '../../../common/enums/identity.enum.js';

export class CreateMatchDto {
  @IsEnum(GameMode, {
    message: 'Game mode harus berupa: SPARING, FUN_GAME, atau TOURNAMENT',
  })
  mode: GameMode;

  @IsUUID('4', { message: 'homeTeamId harus berupa UUID v4 yang valid' })
  @IsNotEmpty()
  homeTeamId: string;

  @IsUUID('4', { message: 'awayTeamId harus berupa UUID v4 yang valid' })
  @IsOptional()
  awayTeamId?: string;

  @IsInt()
  @Min(10)
  @Max(120)
  @IsOptional()
  matchDuration?: number;

  @IsInt()
  @Min(0)
  @Max(15)
  @IsOptional()
  bufferDuration?: number;

  @IsString()
  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime harus menggunakan format HH:mm (contoh: 19:30)',
  })
  startTime?: string;

  @IsString()
  @IsOptional()
  venueName?: string;

  @IsString()
  @IsOptional()
  refereeName?: string;
}