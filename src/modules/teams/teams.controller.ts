import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TeamsService } from './teams.service.js';
import { PlayersService } from '../players/players.service.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { CreatePlayerDto } from '../players/dto/create-player.dto.js';

@Controller('teams')
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly playersService: PlayersService,
  ) {}

  // POST /api/teams -> Buat profil tim baru
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTeam(@Body() createTeamDto: CreateTeamDto) {
    return await this.teamsService.createTeam(createTeamDto);
  }

  // GET /api/teams/:slug -> Get profil publik tim + Roster Pemain + Stats
  @Get(':slug')
  async getTeamBySlug(@Param('slug') slug: string) {
    return await this.teamsService.findBySlug(slug);
  }

  // POST /api/teams/:id/players -> Tambah pemain baru ke Roster Tim
  @Post(':id/players')
  @HttpCode(HttpStatus.CREATED)
  async addPlayerToTeam(
    @Param('id') teamId: string,
    @Body() createPlayerDto: CreatePlayerDto,
  ) {
    const player = await this.playersService.createPlayer(
      teamId,
      createPlayerDto,
    );

    return player
  }
}