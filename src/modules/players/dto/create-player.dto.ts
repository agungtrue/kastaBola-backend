import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsUrl,
  Min,
  Max,
  Length,
} from 'class-validator';
import { PlayerPosition } from '../../../common/enums/identity.enum.js';

export class CreatePlayerDto {
  @IsInt()
  @Min(1)
  @Max(99)
  number: number;

  @IsString()
  @IsNotEmpty()
  @Length(2, 120)
  fullName: string;

  @IsString()
  @IsOptional()
  @Length(2, 50)
  nickname?: string;

  @IsEnum(PlayerPosition, {
    message: 'Posisi harus berupa salah satu dari: GK, DF, MF, FW',
  })
  position: PlayerPosition;

  @IsString()
  @IsOptional()
  @IsUrl({}, { message: 'URL avatar tidak valid' })
  avatarUrl?: string;

  @IsBoolean()
  @IsOptional()
  isCaptain?: boolean;
}