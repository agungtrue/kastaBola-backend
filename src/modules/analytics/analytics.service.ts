import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Team } from '../teams/entities/team.entity.js';
import { Player } from '../players/entities/player.entity.js';
import { Match } from '../matches/entities/match.entity.js';
import { MatchEvent } from '../matches/entities/match-event.entity.js';
import { MatchLineup } from '../matches/entities/match-lineup.entity.js';
import {
  MatchStatus,
  MatchEventType,
  CardType,
} from '../../common/enums/identity.enum.js';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(MatchEvent)
    private readonly eventRepository: Repository<MatchEvent>,
    @InjectRepository(MatchLineup)
    private readonly lineupRepository: Repository<MatchLineup>,
  ) {}

  // 1. GET /api/analytics/teams/:slug/h2h/:opponentSlug -> Head-to-Head
  async getHeadToHead(teamSlug: string, opponentSlug: string) {
    const teamA = await this.teamRepository.findOne({
      where: { publicSlug: teamSlug },
    });
    if (!teamA) {
      throw new NotFoundException(`Tim '${teamSlug}' tidak ditemukan`);
    }

    const teamB = await this.teamRepository.findOne({
      where: { publicSlug: opponentSlug },
    });
    if (!teamB) {
      throw new NotFoundException(`Tim lawan '${opponentSlug}' tidak ditemukan`);
    }

    // Query semua laga FINISHED yang mempertemukan Team A dan Team B
    const matches = await this.matchRepository.find({
      where: [
        { homeTeamId: teamA.id, awayTeamId: teamB.id, status: MatchStatus.FINISHED },
        { homeTeamId: teamB.id, awayTeamId: teamA.id, status: MatchStatus.FINISHED },
      ],
      relations: { homeTeam: true, awayTeam: true },
      order: { createdAt: 'DESC' },
    });

    let teamAWins = 0;
    let teamBWins = 0;
    let draws = 0;
    let teamAGoals = 0;
    let teamBGoals = 0;

    const history = matches.map((match) => {
      const isTeamAHome = match.homeTeamId === teamA.id;
      const scoreA = isTeamAHome ? match.homeScore : match.awayScore;
      const scoreB = isTeamAHome ? match.awayScore : match.homeScore;

      teamAGoals += scoreA;
      teamBGoals += scoreB;

      let result: 'TEAM_A_WIN' | 'TEAM_B_WIN' | 'DRAW' = 'DRAW';
      if (scoreA > scoreB) {
        teamAWins++;
        result = 'TEAM_A_WIN';
      } else if (scoreB > scoreA) {
        teamBWins++;
        result = 'TEAM_B_WIN';
      } else {
        draws++;
      }

      return {
        matchId: match.id,
        date: match.createdAt,
        venueName: match.venueName,
        homeTeam: match.homeTeam?.name,
        awayTeam: match.awayTeam?.name,
        score: `${match.homeScore} - ${match.awayScore}`,
        result,
      };
    });

    return {
      teams: {
        teamA: { id: teamA.id, name: teamA.name, slug: teamA.publicSlug },
        teamB: { id: teamB.id, name: teamB.name, slug: teamB.publicSlug },
      },
      summary: {
        totalMatches: matches.length,
        teamAWins,
        teamBWins,
        draws,
        teamAGoals,
        teamBGoals,
      },
      history,
    };
  }

  // 2. GET /api/analytics/teams/:slug/form -> Form Guide Laga Terakhir
  async getTeamForm(slug: string, limit: number = 5) {
    const team = await this.teamRepository.findOne({
      where: { publicSlug: slug },
    });

    if (!team) {
      throw new NotFoundException(`Tim '${slug}' tidak ditemukan`);
    }

    const matches = await this.matchRepository.find({
      where: [
        { homeTeamId: team.id, status: MatchStatus.FINISHED },
        { awayTeamId: team.id, status: MatchStatus.FINISHED },
      ],
      relations: { homeTeam: true, awayTeam: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    const formGuide: ('W' | 'D' | 'L')[] = [];
    let goalsScored = 0;
    let goalsConceded = 0;
    let cleanSheets = 0;
    let wins = 0;

    const matchHistory = matches.map((match) => {
      const isHome = match.homeTeamId === team.id;
      const scored = isHome ? match.homeScore : match.awayScore;
      const conceded = isHome ? match.awayScore : match.homeScore;

      goalsScored += scored;
      goalsConceded += conceded;

      if (conceded === 0) {
        cleanSheets++;
      }

      let outcome: 'W' | 'D' | 'L' = 'D';
      if (scored > conceded) {
        outcome = 'W';
        wins++;
      } else if (scored < conceded) {
        outcome = 'L';
      }

      formGuide.push(outcome);

      return {
        matchId: match.id,
        opponent: isHome ? match.awayTeam?.name : match.homeTeam?.name,
        isHome,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        goalsScored: scored,
        goalsConceded: conceded,
        outcome,
        date: match.createdAt,
      };
    });

    const totalPlayed = matches.length;
    const winRate = totalPlayed > 0 ? Math.round((wins / totalPlayed) * 100) : 0;

    return {
      team: {
        id: team.id,
        name: team.name,
        slug: team.publicSlug,
        eloRating: team.eloRating,
      },
      formGuide, // Array tren performa (terbaru ke terlama)
      summary: {
        matchesEvaluated: totalPlayed,
        wins,
        draws: formGuide.filter((f) => f === 'D').length,
        losses: formGuide.filter((f) => f === 'L').length,
        winRatePercent: winRate,
        goalsScored,
        goalsConceded,
        cleanSheets,
      },
      matchHistory,
    };
  }

  // 3. GET /api/analytics/players/:id/career-stats -> Deep Dive Karir Pemain
  async getPlayerCareerStats(playerId: string) {
    const player = await this.playerRepository.findOne({
      where: { id: playerId },
      relations: { team: true },
    });

    if (!player) {
      throw new NotFoundException(`Pemain dengan ID '${playerId}' tidak ditemukan`);
    }

    // Ambil daftar laga FINISHED yang diikuti pemain via MatchLineup
    const lineups = await this.lineupRepository.find({
      where: { playerId },
      relations: { match: true },
    });

    const finishedMatchIds = lineups
      .filter((l) => l.match && l.match.status === MatchStatus.FINISHED)
      .map((l) => l.matchId);

    const matchesPlayed = finishedMatchIds.length;

    if (matchesPlayed === 0) {
      return {
        player,
        stats: {
          matchesPlayed: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          cleanSheets: 0,
        },
      };
    }

    // HITUNG GOL
    const goals = await this.eventRepository.count({
      where: {
        scorerPlayerId: playerId,
        type: MatchEventType.GOAL,
        matchId: In(finishedMatchIds),
      },
    });

    // HITUNG ASSIST
    const assists = await this.eventRepository.count({
      where: {
        assistPlayerId: playerId,
        type: MatchEventType.GOAL,
        matchId: In(finishedMatchIds),
      },
    });

    // HITUNG KARTU KUNING
    const yellowCards = await this.eventRepository.count({
      where: {
        targetPlayerId: playerId,
        type: MatchEventType.CARD,
        cardType: CardType.YELLOW,
        matchId: In(finishedMatchIds),
      },
    });

    // HITUNG KARTU MERAH
    const redCards = await this.eventRepository.count({
      where: {
        targetPlayerId: playerId,
        type: MatchEventType.CARD,
        cardType: CardType.RED,
        matchId: In(finishedMatchIds),
      },
    });

    // HITUNG CLEAN SHEETS (Jika tim pemain tidak kebobolan saat laga selesai)
    const matches = await this.matchRepository.find({
      where: { id: In(finishedMatchIds) },
    });

    let cleanSheets = 0;
    for (const match of matches) {
      const isHome = match.homeTeamId === player.teamId;
      const goalsConceded = isHome ? match.awayScore : match.homeScore;
      if (goalsConceded === 0) {
        cleanSheets++;
      }
    }

    return {
      player: {
        id: player.id,
        fullName: player.fullName,
        nickname: player.nickname,
        number: player.number,
        position: player.position,
        teamName: player.team?.name,
        teamSlug: player.team?.publicSlug,
      },
      stats: {
        matchesPlayed,
        goals,
        assists,
        yellowCards,
        redCards,
        cleanSheets,
      },
    };
  }
}