import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './entities/player.entity.js';
import { Team } from '../teams/entities/team.entity.js';
import { Match } from '../matches/entities/match.entity.js';
import { MatchLineup } from '../matches/entities/match-lineup.entity.js'
import { MatchEvent } from '../matches/entities/match-event.entity.js'
import { PlayersController } from './players.controller.js';
import { PlayersService } from './players.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Player, Team, Match, MatchLineup, MatchEvent])],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}