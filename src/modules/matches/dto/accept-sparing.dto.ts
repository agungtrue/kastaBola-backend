import { IsUUID, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class AcceptSparingDto {
  @IsUUID('4', { message: 'awayTeamId harus berupa UUID v4 yang valid' })
  @IsNotEmpty()
  awayTeamId: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'PIN Sparing harus tepat 6 digit angka' })
  @Matches(/^[0-9]{6}$/, { message: 'PIN Sparing hanya boleh berisi angka' })
  matchPin: string;
}