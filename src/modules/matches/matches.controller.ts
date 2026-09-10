import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Delete,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { MatchesService } from './matches.service.js';
import { CreateMatchDto } from './dto/create-match.dto.js';
import { AcceptSparingDto } from './dto/accept-sparing.dto.js';
import { SubmitLineupDto } from './dto/submit-lineup.dto.js';
import { RecordMatchEventDto } from './dto/record-match-event.dto.js';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto.js';
import { AuthRoles } from '../..//common/decorators/auth.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../..//common/guards/roles.guard.js';
import { CustomerRole } from '../../common/enums/identity.enum.js';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createMatch(@Body() createMatchDto: CreateMatchDto) {
    return await this.matchesService.createMatch(createMatchDto);
  }

  @Post(':id/accept-sparing')
  @HttpCode(HttpStatus.OK)
  async acceptSparing(
    @Param('id') matchId: string,
    @Body() acceptSparingDto: AcceptSparingDto,
  ) {
    return await this.matchesService.acceptSparing(matchId, acceptSparingDto);
  }

//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @AuthRoles(CustomerRole.REFEREE)
  @Get(':id')
  async getMatchDetail(@Param('id') id: string) {
    return await this.matchesService.findOne(id);
  }

  @Post(':id/lineups')
  @HttpCode(HttpStatus.CREATED)
  async submitLineup(
    @Param('id') matchId: string,
    @Body() submitLineupDto: SubmitLineupDto,
  ) {
    return await this.matchesService.submitLineup(matchId, submitLineupDto);
  }

  @Get(':id/lineups')
  async getMatchLineups(@Param('id') matchId: string) {
    return await this.matchesService.getMatchLineups(matchId);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateMatchStatus(
    @Param('id') id: string,
    @Body() dto: UpdateMatchStatusDto,
  ) {
    return await this.matchesService.updateMatchStatus(id, dto);
  }

  @Post(':id/events')
  @HttpCode(HttpStatus.CREATED)
  async recordMatchEvent(
    @Param('id') matchId: string,
    @Body() dto: RecordMatchEventDto,
  ) {
    return await this.matchesService.recordMatchEvent(matchId, dto);
  }

  @Delete(':id/events/:eventId')
  @HttpCode(HttpStatus.OK)
  async deleteMatchEvent(
    @Param('id') matchId: string,
    @Param('eventId') eventId: string,
    @Query('refereeToken') refereeToken: string,
  ) {
    return await this.matchesService.deleteMatchEvent(
      matchId,
      eventId,
      refereeToken,
    );
  }

  @Get(':id/live-feed')
  async getLiveFeed(@Param('id') matchId: string) {
    return await this.matchesService.getLiveFeed(matchId);
  }

  @Get('sparing/open')
    async getOpenSparingFeed() {
      return await this.matchesService.getOpenSparingFeed();
    }
}