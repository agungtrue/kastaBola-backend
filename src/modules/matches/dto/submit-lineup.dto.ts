import {
  IsUUID,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PlayerPosition } from '../../../common/enums/identity.enum.js';

export class LineupItemDto {
  @IsUUID('4', { message: 'playerId harus berupa UUID v4 yang valid' })
  @IsNotEmpty()
  playerId: string;

  @IsEnum(PlayerPosition, {
    message: 'Posisi pemain harus berupa: GK, DF, MF, atau FW',
  })
  position: PlayerPosition;

  @IsBoolean()
  isCaptain: boolean;
}

export class SubmitLineupDto {
  @IsUUID('4', { message: 'teamId harus berupa UUID v4 yang valid' })
  @IsNotEmpty()
  teamId: string;

  @IsArray()
  @ArrayMinSize(5, { message: 'Lineup minimal terdiri dari 5 pemain' })
  @ValidateNested({ each: true })
  @Type(() => LineupItemDto)
  players: LineupItemDto[];
}