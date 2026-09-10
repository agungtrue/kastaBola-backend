import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity.js';
import { Team } from '../teams/entities/team.entity.js';
import { Player } from '../players/entities/player.entity.js';
import { MatchLineup } from './entities/match-lineup.entity.js';
import { MatchEvent } from './entities/match-event.entity.js';
import { MatchesController } from './matches.controller.js';
import { MatchesService } from './matches.service.js';
import { MatchesGateway } from './matches.gateway.js';
import { AuthModule } from '../../modules/auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, Team, MatchLineup, MatchEvent, Player]),
    AuthModule,
  ],
  controllers: [MatchesController],
  providers: [MatchesService, MatchesGateway],
  exports: [MatchesService],
})
export class MatchesModule {}