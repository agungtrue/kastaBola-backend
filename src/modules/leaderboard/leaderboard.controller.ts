import { Controller, Get, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service.js';
import { GetLeaderboardQueryDto } from './dto/get-leaderboard-query.dto.js';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('teams')
  async getTeamLeaderboard(@Query() query: GetLeaderboardQueryDto) {
    return await this.leaderboardService.getTeamLeaderboard(query.limit);
  }

  @Get('top-scorers')
  async getTopScorers(@Query() query: GetLeaderboardQueryDto) {
    return await this.leaderboardService.getTopScorers(query.limit);
  }
}