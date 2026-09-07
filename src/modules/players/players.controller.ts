import { Controller, Patch, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { PlayersService } from './players.service.js';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  // PATCH /api/players/:id/toggle-status -> Nonaktifkan/aktifkan pemain
  @Patch(':id/toggle-status')
  @HttpCode(HttpStatus.OK)
  async togglePlayerStatus(@Param('id') playerId: string) {
    const player = await this.playersService.togglePlayerStatus(playerId);
    return {
      message: `Status pemain ${player.fullName} berhasil diubah menjadi ${
        player.isActive ? 'AKTIF' : 'NONAKTIF'
      }`,
      data: player,
    };
  }
}