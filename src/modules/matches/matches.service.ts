import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MatchesGateway } from './matches.gateway.js';
import { Match } from './entities/match.entity.js';
import { Team } from '../teams/entities/team.entity.js';
import { Player } from '../players/entities/player.entity.js';
import { MatchLineup } from './entities/match-lineup.entity.js';
import { MatchEvent } from './entities/match-event.entity.js';
import { CreateMatchDto } from './dto/create-match.dto.js';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto.js';
import { RecordMatchEventDto } from './dto/record-match-event.dto.js';
import { AcceptSparingDto } from './dto/accept-sparing.dto.js';
import { SubmitLineupDto } from './dto/submit-lineup.dto.js';
import { GameMode, MatchStatus, MatchEventType, TeamSide } from '../../common/enums/identity.enum.js';
import {
  generateMatchPin,
  generateRefereeToken,
} from '../../common/utils/match-code.util.js';
import { calculateEloUpdate } from '../../common/utils/elo.util.js';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(MatchLineup)
    private readonly lineupRepository: Repository<MatchLineup>,
    @InjectRepository(MatchEvent)
    private readonly eventRepository: Repository<MatchEvent>,
    private readonly matchesGateway: MatchesGateway,
  ) {}

  async createMatch(dto: CreateMatchDto): Promise<Match> {
    const homeTeam = await this.teamRepository.findOne({
      where: { id: dto.homeTeamId },
    });
    if (!homeTeam) {
      throw new NotFoundException(
        `Home Team dengan ID '${dto.homeTeamId}' tidak ditemukan`,
      );
    }

    if (dto.awayTeamId) {
      if (dto.homeTeamId === dto.awayTeamId) {
        throw new BadRequestException(
          'Home Team dan Away Team tidak boleh sama',
        );
      }
      const awayTeam = await this.teamRepository.findOne({
        where: { id: dto.awayTeamId },
      });
      if (!awayTeam) {
        throw new NotFoundException(
          `Away Team dengan ID '${dto.awayTeamId}' tidak ditemukan`,
        );
      }
    }

    let status = MatchStatus.WAITING_ACCEPTANCE;
    let matchPin: string | null = null;
    let refereeToken: string | null = null;

    if (dto.mode === GameMode.SPARING) {
      if (dto.awayTeamId) {
        // Jika lawan diset langsung saat pembuatan
        status = MatchStatus.SCHEDULED;
        refereeToken = generateRefereeToken();
      } else {
        // Open Sparing Hub: butuh PIN untuk lawan join
        matchPin = generateMatchPin();
      }
    } else {
      // Fun Game / Tournament: Langsung Terjadwal & Siap Wasit
      status = MatchStatus.SCHEDULED;
      refereeToken = generateRefereeToken();
    }

    const match = this.matchRepository.create({
      ...dto,
      status,
      matchPin,
      refereeToken,
      matchDuration: dto.matchDuration || 15,
      bufferDuration: dto.bufferDuration || 5,
      startTime: dto.startTime || '19:30',
      venueName: dto.venueName || homeTeam.homeground || 'Kastabola Arena',
    });

    return await this.matchRepository.save(match);
  }

  async acceptSparing(
    matchId: string,
    dto: AcceptSparingDto,
  ): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
      relations: { homeTeam: true },
    });

    if (!match) {
      throw new NotFoundException(
        `Pertandingan dengan ID '${matchId}' tidak ditemukan`,
      );
    }

    if (match.status !== MatchStatus.WAITING_ACCEPTANCE) {
      throw new ConflictException(
        'Pertandingan ini tidak lagi menerima tantangan Sparing',
      );
    }

    if (match.homeTeamId === dto.awayTeamId) {
      throw new BadRequestException('Tim tidak bisa bertanding melawan diri sendiri');
    }

    const awayTeam = await this.teamRepository.findOne({
      where: { id: dto.awayTeamId },
    });
    if (!awayTeam) {
      throw new NotFoundException(
        `Away Team dengan ID '${dto.awayTeamId}' tidak ditemukan`,
      );
    }

    // Verifikasi Keamanan PIN 6-Digit
    if (match.matchPin !== dto.matchPin) {
      throw new ForbiddenException('PIN Sparing yang Anda masukkan salah');
    }

    match.awayTeamId = dto.awayTeamId;
    match.awayTeam = awayTeam;
    match.status = MatchStatus.SCHEDULED;
    match.refereeToken = generateRefereeToken();
    match.matchPin = null;

    return await this.matchRepository.save(match);
  }

  async findOne(id: string): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: {
        homeTeam: true,
        awayTeam: true,
        lineups: {
          player: true,
        },
        events: {
          scorer: true,
          assist: true,
        },
      },
    });

    if (!match) {
      throw new NotFoundException(
        `Pertandingan dengan ID '${id}' tidak ditemukan`,
      );
    }

    return match;
  }

  async submitLineup(
    matchId: string,
    dto: SubmitLineupDto,
  ): Promise<MatchLineup[]> {
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException(
        `Pertandingan dengan ID '${matchId}' tidak ditemukan`,
      );
    }

    if (match.status === MatchStatus.FINISHED) {
      throw new BadRequestException(
        'Tidak dapat mengubah lineup untuk pertandingan yang sudah selesai',
      );
    }

    // Validasi: Apakah teamId bagian dari Home atau Away team pertandingan ini?
    if (match.homeTeamId !== dto.teamId && match.awayTeamId !== dto.teamId) {
      throw new ForbiddenException(
        'Tim ini tidak terdaftar dalam pertandingan ini',
      );
    }

    // Validasi 1: Cek duplikasi playerId dalam payload submission
    const playerIds = dto.players.map((p) => p.playerId);
    const uniquePlayerIds = new Set(playerIds);
    if (uniquePlayerIds.size !== playerIds.length) {
      throw new BadRequestException(
        'Terdapat duplikasi pemain dalam daftar lineup yang dikirim',
      );
    }

    // Validasi 2: Harus ada TEPAT 1 kapten dalam lineup
    const captainCount = dto.players.filter((p) => p.isCaptain).length;
    if (captainCount !== 1) {
      throw new BadRequestException(
        'Lineup pertandingan harus memiliki TEPAT 1 kapten tim',
      );
    }

    // Validasi 3: Verifikasi keberadaan pemain & keanggotaan tim di database
    const dbPlayers = await this.playerRepository.find({
      where: { id: In(playerIds) },
    });

    if (dbPlayers.length !== playerIds.length) {
      throw new NotFoundException(
        'Satu atau lebih pemain dalam lineup tidak ditemukan di sistem',
      );
    }

    for (const player of dbPlayers) {
      if (player.teamId !== dto.teamId) {
        throw new BadRequestException(
          `Pemain ${player.fullName} (#${player.number}) bukan bagian dari tim ini`,
        );
      }
      if (!player.isActive) {
        throw new BadRequestException(
          `Pemain ${player.fullName} (#${player.number}) berstatus non-aktif`,
        );
      }
    }

    // Replace Strategy: Hapus lineup lama tim ini untuk pertandingan ini (jika re-submit)
    await this.lineupRepository.delete({
      matchId,
      teamId: dto.teamId,
    });

    // Buat entitas lineup baru
    const lineupEntities = dto.players.map((item) =>
      this.lineupRepository.create({
        matchId,
        teamId: dto.teamId,
        playerId: item.playerId,
        position: item.position,
        isCaptain: item.isCaptain,
      }),
    );

    return await this.lineupRepository.save(lineupEntities);
  }

  async getMatchLineups(matchId: string) {
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
      relations: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    if (!match) {
      throw new NotFoundException(
        `Pertandingan dengan ID '${matchId}' tidak ditemukan`,
      );
    }

    const lineups = await this.lineupRepository.find({
      where: { matchId },
      relations: {
        player: true,
      },
    });

    const homeLineup = lineups.filter((l) => l.teamId === match.homeTeamId);
    const awayLineup = lineups.filter((l) => l.teamId === match.awayTeamId);

    return {
      matchId: match.id,
      homeTeam: {
        info: match.homeTeam,
        lineup: homeLineup,
      },
      awayTeam: {
        info: match.awayTeam,
        lineup: awayLineup,
      },
    };
  }

  async updateMatchStatus(
    id: string,
    dto: UpdateMatchStatusDto,
  ): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: { homeTeam: true, awayTeam: true },
    });

    if (!match) {
      throw new NotFoundException(`Pertandingan dengan ID '${id}' tidak ditemukan`);
    }

    // Security Check: Validasi Wasit Token
    if (match.refereeToken !== dto.refereeToken) {
      throw new UnauthorizedException('Token Wasit tidak valid');
    }

    const previousStatus = match.status;
    match.status = dto.status;

    // Trigger: Jika pertandingan resmi FINISHED, hitung ulang Elo Rating kedua tim
    if (
      dto.status === MatchStatus.FINISHED &&
      previousStatus !== MatchStatus.FINISHED &&
      match.homeTeam &&
      match.awayTeam
    ) {
      const { newHomeElo, newAwayElo } = calculateEloUpdate(
        match.homeTeam.eloRating,
        match.awayTeam.eloRating,
        match.homeScore,
        match.awayScore,
      );

      match.homeTeam.eloRating = newHomeElo;
      match.awayTeam.eloRating = newAwayElo;

      await this.teamRepository.save([match.homeTeam, match.awayTeam]);
    }

    const updatedMatch = await this.matchRepository.save(match);

    this.matchesGateway.broadcastStatusChange(id, { status: updatedMatch.status });

    return updatedMatch;
  }

  // 2. POST /api/matches/:id/events -> Record Event (Gol / Kartu)
  async recordMatchEvent(
    matchId: string,
    dto: RecordMatchEventDto,
  ): Promise<MatchEvent> {
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException(`Pertandingan dengan ID '${matchId}' tidak ditemukan`);
    }

    // Security Check
    if (match.refereeToken !== dto.refereeToken) {
      throw new UnauthorizedException('Token Wasit tidak valid');
    }

    if (match.status !== MatchStatus.LIVE) {
      throw new BadRequestException('Event hanya dapat dicatat saat pertandingan berstatus LIVE');
    }

    const event = this.eventRepository.create({
      matchId,
      teamSide: dto.teamSide,
      minute: dto.minute,
      type: dto.type,
      cardType: dto.cardType || null,
      scorerPlayerId: dto.scorerPlayerId || null,
      assistPlayerId: dto.assistPlayerId || null,
      targetPlayerId: dto.targetPlayerId || null,
    });

    const savedEvent = await this.eventRepository.save(event);

    if (dto.type === MatchEventType.GOAL) {
      if (dto.teamSide === TeamSide.HOME) {
        match.homeScore += 1;
      } else {
        match.awayScore += 1;
      }
      await this.matchRepository.save(match);
    }

    this.matchesGateway.broadcastEventLogged(matchId, savedEvent);
    this.matchesGateway.broadcastScoreUpdate(matchId, {
      homeScore: match.homeScore,
      awayScore: match.awayScore,
    });

    return savedEvent;
  }

  async deleteMatchEvent(
    matchId: string,
    eventId: string,
    refereeToken: string,
  ) {
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException(`Pertandingan dengan ID '${matchId}' tidak ditemukan`);
    }

    if (match.refereeToken !== refereeToken) {
      throw new UnauthorizedException('Token Wasit tidak valid');
    }

    const event = await this.eventRepository.findOne({
      where: { id: eventId, matchId },
    });

    if (!event) {
      throw new NotFoundException(`Event dengan ID '${eventId}' tidak ditemukan`);
    }

    // Koreksi Skor jika Event yang dihapus adalah GOAL
    if (event.type === MatchEventType.GOAL) {
      if (event.teamSide === TeamSide.HOME) {
        match.homeScore = Math.max(0, match.homeScore - 1);
      } else {
        match.awayScore = Math.max(0, match.awayScore - 1);
      }
      await this.matchRepository.save(match);
    }

    await this.eventRepository.remove(event);

    this.matchesGateway.broadcastScoreUpdate(matchId, {
      homeScore: match.homeScore,
      awayScore: match.awayScore,
    });

    return { message: 'Event berhasil dibatalkan dan skor disesuaikan' };
  }

  async getLiveFeed(matchId: string) {
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
      relations: {
        homeTeam: true,
        awayTeam: true,
        events: {
          scorer: true,
          assist: true,
          targetPlayer: true,
        },
      },
    });

    if (!match) {
      throw new NotFoundException(`Pertandingan dengan ID '${matchId}' tidak ditemukan`);
    }

    // Urutkan event berdasarkan menit terkecil ke terbesar
    const timeline = (match.events || []).sort((a, b) => a.minute - b.minute);

    return {
      matchId: match.id,
      status: match.status,
      mode: match.mode,
      duration: match.matchDuration,
      startTime: match.startTime,
      venueName: match.venueName,
      scoreboard: {
        homeTeam: {
          id: match.homeTeam?.id,
          name: match.homeTeam?.name,
          shortCode: match.homeTeam?.shortCode,
          score: match.homeScore,
        },
        awayTeam: {
          id: match.awayTeam?.id,
          name: match.awayTeam?.name,
          shortCode: match.awayTeam?.shortCode,
          score: match.awayScore,
        },
      },
      timeline,
    };
  }

  async getOpenSparingFeed() {
    return await this.matchRepository.find({
      where: {
        mode: GameMode.SPARING,
        status: MatchStatus.WAITING_ACCEPTANCE,
      },
      relations: {
        homeTeam: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
  
}