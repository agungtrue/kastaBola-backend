import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../teams/entities/team.entity.js';
import { MatchEvent } from '../matches/entities/match-event.entity.js';
import { Match } from '../matches/entities/match.entity.js';
import { MatchStatus, GameMode } from '../../common/enums/identity.enum.js';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(MatchEvent)
    private readonly eventRepository: Repository<MatchEvent>,
  ) {}

  async getTeamLeaderboard(limit: number = 10) {
    return await this.teamRepository.find({
      order: {
        eloRating: 'DESC',
        name: 'ASC',
      },
      take: limit,
    });
  }

  async getTopScorers(limit: number = 10) {
    const rawTopScorers = await this.eventRepository
      .createQueryBuilder('event')
      .innerJoin('event.match', 'match')
      .innerJoinAndSelect('event.scorer', 'player')
      .innerJoinAndSelect('player.team', 'team')
      .select([
        'player.id AS "playerId"',
        'player.fullName AS "fullName"',
        'player.nickname AS "nickname"',
        'player.number AS "number"',
        'player.avatarUrl AS "avatarUrl"',
        'team.name AS "teamName"',
        'team.publicSlug AS "teamSlug"',
      ])
      .addSelect('COUNT(event.id)', 'goalsCount')
      .where('event.type = :type', { type: 'GOAL' })
      .andWhere('match.status = :status', { status: MatchStatus.FINISHED })
      .groupBy('player.id')
      .addGroupBy('team.id')
      .orderBy('"goalsCount"', 'DESC')
      .limit(limit)
      .getRawMany();

    return rawTopScorers.map((item) => ({
      player: {
        id: item.playerId,
        fullName: item.fullName,
        nickname: item.nickname,
        number: Number(item.number),
        avatarUrl: item.avatarUrl,
        teamName: item.teamName,
        teamSlug: item.teamSlug,
      },
      goalsCount: Number(item.goalsCount),
    }));
  }
}