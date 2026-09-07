import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity.js';
import { Team } from '../teams/entities/team.entity.js';
import { CreatePlayerDto } from './dto/create-player.dto.js';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  // 3. POST /api/teams/:id/players -> Tambah pemain baru ke Roster Tim
  async createPlayer(teamId: string, dto: CreatePlayerDto): Promise<Player> {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException(`Tim dengan ID '${teamId}' tidak ditemukan`);
    }

    // Validasi nomor punggung ganda dalam satu tim
    const existingJerseyNumber = await this.playerRepository.findOne({
      where: { teamId, number: dto.number, isActive: true },
    });

    if (existingJerseyNumber) {
      throw new ConflictException(
        `Nomor punggung #${dto.number} sudah digunakan oleh ${existingJerseyNumber.fullName} di tim ini`,
      );
    }

    // Jika ditandai sebagai kapten baru, hapus status kapten pemain lama
    if (dto.isCaptain) {
      await this.playerRepository.update(
        { teamId, isCaptain: true },
        { isCaptain: false },
      );
    }

    const player = this.playerRepository.create({
      ...dto,
      teamId,
      nickname: dto.nickname || dto.fullName.split(' ')[0],
    });

    return await this.playerRepository.save(player);
  }

  // 4. PATCH /api/players/:id/toggle-status -> Nonaktifkan/aktifkan pemain
  async togglePlayerStatus(playerId: string): Promise<Player> {
    const player = await this.playerRepository.findOne({
      where: { id: playerId },
    });

    if (!player) {
      throw new NotFoundException(
        `Pemain dengan ID '${playerId}' tidak ditemukan`,
      );
    }

    player.isActive = !player.isActive;
    return await this.playerRepository.save(player);
  }
}