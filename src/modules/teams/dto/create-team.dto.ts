import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  shortCode: string;

  @IsString()
  @IsOptional()
  @Length(3, 255)
  homeground?: string;

  @IsString()
  @IsOptional()
  @Length(4, 4)
  establishedYear?: string;

  @IsString()
  @IsOptional()
  @Matches(/^08[0-9]{8,11}$/, {
    message: 'Nomor telepon kapten harus berupa nomor Indonesia yang valid (contoh: 081234567890)',
  })
  captainPhone?: string;
}