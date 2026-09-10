import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MatchStatus } from '../../../common/enums/identity.enum.js';

export class UpdateMatchStatusDto {
  @IsEnum(MatchStatus, {
    message: 'Status harus berupa: SCHEDULED, LIVE, PAUSED, atau FINISHED',
  })
  status: MatchStatus;

  @IsString()
  @IsNotEmpty({ message: 'refereeToken wajib diisi untuk otorisasi wasit' })
  refereeToken: string;
}