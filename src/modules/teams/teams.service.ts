import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { generateSlug } from '../../common/utils/slug.util.js';
import { MatchStatus, PlayerPosition } from '../../common/enums/identity.enum.js';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  // 1. POST /api/teams -> Buat profil tim baru
  async createTeam(dto: CreateTeamDto): Promise<Team> {
    let baseSlug = generateSlug(dto.name);
    let publicSlug = baseSlug;
    let counter = 1;

    // Handle slug collision (e.g., bingung-fc, bingung-fc-1)
    while (await this.teamRepository.findOne({ where: { publicSlug } })) {
      publicSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const team = this.teamRepository.create({
      ...dto,
      publicSlug,
      shortCode: dto.shortCode.toUpperCase(),
      eloRating: 1600,
    });

    return await this.teamRepository.save(team);
  }

  // 2. GET /api/teams/:slug -> Get profil publik tim + Roster Pemain + Stats Terakumulasi
  async findBySlug(slug: string) {
    const team = await this.teamRepository.findOne({
      where: { publicSlug: slug },
      relations: {
        players: true,
        homeMatches: {
          events: true,
          lineups: true,
        },
        awayMatches: {
          events: true,
          lineups: true,
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Tim dengan slug '${slug}' tidak ditemukan`);
    }

    // Gabungkan seluruh pertandingan (Home & Away) yang sudah FINISHED
    const allMatches = [...team.homeMatches, ...team.awayMatches].filter(
      (m) => m.status === MatchStatus.FINISHED,
    );

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    let cleanSheets = 0;

    allMatches.forEach((match) => {
      const isHome = match.homeTeamId === team.id;
      const myScore = isHome ? match.homeScore : match.awayScore;
      const opponentScore = isHome ? match.awayScore : match.homeScore;

      goalsFor += myScore;
      goalsAgainst += opponentScore;

      if (opponentScore === 0) cleanSheets++;

      if (myScore > opponentScore) wins++;
      else if (myScore === opponentScore) draws++;
      else losses++;
    });

    const totalMatches = allMatches.length;
    const winRate = totalMatches > 0 ? Number(((wins / totalMatches) * 100).toFixed(1)) : 0.0;

    // Akumulasi statistik per pemain dari match_events & match_lineups
    const playersWithStats = await Promise.all(
      team.players.map(async (player) => {
        // Hitung total penampilan (match played)
        const matchesPlayed = await this.teamRepository.manager
          .createQueryBuilder('MatchLineup', 'lineup')
          .innerJoin('lineup.match', 'match')
          .where('lineup.playerId = :playerId', { playerId: player.id })
          .andWhere('match.status = :status', { status: MatchStatus.FINISHED })
          .getCount();

        // Hitung total Gol dicetak
        const goalsCount = await this.teamRepository.manager
          .createQueryBuilder('MatchEvent', 'event')
          .where('event.scorerPlayerId = :playerId', { playerId: player.id })
          .andWhere("event.type = 'GOAL'")
          .getCount();

        // Hitung total Assist diberikan
        const assistsCount = await this.teamRepository.manager
          .createQueryBuilder('MatchEvent', 'event')
          .where('event.assistPlayerId = :playerId', { playerId: player.id })
          .andWhere("event.type = 'GOAL'")
          .getCount();

        // Default statistik bertahan (Clean Sheet & Kebobolan khusus GK / DF)
        let cleanSheetsCount = 0;
        let goalsConcededCount = 0;

        if (player.position === PlayerPosition.GK || player.position === PlayerPosition.DF) {
          // Cari match di mana pemain ini masuk sebagai lineup
          const playerLineupMatches = await this.teamRepository.manager
            .createQueryBuilder('MatchLineup', 'lineup')
            .innerJoinAndSelect('lineup.match', 'match')
            .where('lineup.playerId = :playerId', { playerId: player.id })
            .andWhere('match.status = :status', { status: MatchStatus.FINISHED })
            .getMany();

          playerLineupMatches.forEach((l) => {
            const m = l.match;
            const isHome = m.homeTeamId === team.id;
            const conceded = isHome ? m.awayScore : m.homeScore;

            goalsConcededCount += conceded;
            if (conceded === 0) cleanSheetsCount++;
          });
        }

        // Formula KPR Rating (Kastabola Performance Rating)
        const rating = this.calculateKprRating(
          player.position,
          matchesPlayed,
          goalsCount,
          assistsCount,
          cleanSheetsCount,
          goalsConcededCount,
        );

        return {
          ...player,
          matchesPlayed,
          goalsCount,
          assistsCount,
          cleanSheetsCount,
          goalsConcededCount,
          rating,
        };
      }),
    );

    // Ambil Top 3 Performers terurut berdasarkan KPR Rating
    const topPerformers = [...playersWithStats]
      .filter((p) => p.isActive)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);

    return {
      team: {
        id: team.id,
        name: team.name,
        shortCode: team.shortCode,
        homeground: team.homeground,
        eloRating: team.eloRating,
        publicSlug: team.publicSlug,
        establishedYear: team.establishedYear,
        captainPhone: team.captainPhone,
      },
      statsSummary: {
        totalMatches,
        winRate,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst,
        cleanSheets,
      },
      topPerformers,
      roster: playersWithStats.sort((a, b) => a.number - b.number),
    };
  }

  // HELPER: Formula KPR (1.0 - 10.0)
  private calculateKprRating(
    position: PlayerPosition,
    matchesPlayed: number,
    goals: number,
    assists: number,
    cleanSheets: number,
    conceded: number,
  ): number {
    if (matchesPlayed === 0) return 6.0;

    let points = 0;
    if (position === PlayerPosition.GK) {
      points = cleanSheets * 2.0 - conceded * 0.5 + assists * 1.0;
    } else if (position === PlayerPosition.DF) {
      points = cleanSheets * 1.2 - conceded * 0.3 + goals * 1.5 + assists * 1.0;
    } else {
      points = goals * 1.5 + assists * 1.0;
    }

    const avgContrib = points / matchesPlayed;
    const calculated = 6.0 + avgContrib * 1.2;
    return Number(Math.max(1.0, Math.min(10.0, calculated)).toFixed(1));
  }
}
