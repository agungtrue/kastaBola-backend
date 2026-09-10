import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../teams/entities/team.entity.js';
import { Player } from '../players/entities/player.entity.js';
import { Match } from '../matches/entities/match.entity.js';
import { MatchEvent } from '../matches/entities/match-event.entity.js';
import { MatchLineup } from '../matches/entities/match-lineup.entity.js';
import { AnalyticsController } from './analytics.controller.js';
import { AnalyticsService } from './analytics.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Team,
      Player,
      Match,
      MatchEvent,
      MatchLineup,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}