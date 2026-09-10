import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service.js';
import { GetAnalyticsQueryDto } from './dto/get-analytics-query.dto.js';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('teams/:slug/h2h/:opponentSlug')
  async getHeadToHead(
    @Param('slug') teamSlug: string,
    @Param('opponentSlug') opponentSlug: string,
  ) {
    return await this.analyticsService.getHeadToHead(teamSlug, opponentSlug);
  }

  @Get('teams/:slug/form')
  async getTeamForm(
    @Param('slug') slug: string,
    @Query() query: GetAnalyticsQueryDto,
  ) {
    return await this.analyticsService.getTeamForm(slug, query.limit);
  }

  @Get('players/:id/career-stats')
  async getPlayerCareerStats(@Param('id') playerId: string) {
    return await this.analyticsService.getPlayerCareerStats(playerId);
  }
}