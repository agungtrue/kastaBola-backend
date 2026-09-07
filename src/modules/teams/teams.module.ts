import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsController } from './teams.controller.js';

import { TeamsService } from './teams.service.js';
import { PlayersService } from '../players/players.service.js';

import { Team } from './entities/team.entity.js';
import { Player } from '../players/entities/player.entity.js';
import { Match } from '../matches/entities/match.entity.js';
import { MatchLineup } from '../matches/entities/match-lineup.entity.js'
import { MatchEvent } from '../matches/entities/match-event.entity.js'

@Module({
  imports: [TypeOrmModule.forFeature([Team, Player, Match, MatchLineup, MatchEvent])],
  controllers: [TeamsController],
  providers: [TeamsService, PlayersService],
  exports: [TeamsService],
})
export class TeamsModule {}