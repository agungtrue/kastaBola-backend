import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Team } from '../../teams/entities/team.entity.js';
import { GameMode, MatchStatus } from '../../../common/enums/identity.enum.js';
import { MatchLineup } from './match-lineup.entity.js';
import { MatchEvent } from './match-event.entity.js';

@Entity('matches')
@Index(['mode', 'status', 'createdAt'])
@Index(['homeTeamId', 'status', 'createdAt'])
@Index(['awayTeamId', 'status', 'createdAt'])
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: GameMode, default: GameMode.SPARING })
  mode: GameMode;

  @Column({ type: 'enum', enum: MatchStatus, default: MatchStatus.WAITING_ACCEPTANCE })
  status: MatchStatus;

  @Column({ type: 'uuid' })
  homeTeamId: string;

  @Column({ type: 'uuid' })
  awayTeamId: string;

  @Index()
  @Column({ type: 'varchar', length: 6, nullable: true })
  matchPin: string;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  refereeToken: string;

  @Column({ type: 'int', default: 15 })
  matchDuration: number;

  @Column({ type: 'int', default: 5 })
  bufferDuration: number;

  @Column({ type: 'varchar', length: 10, default: '19:00' })
  startTime: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  venueName: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  refereeName: string;

  @Column({ type: 'int', default: 0 })
  homeScore: number;

  @Column({ type: 'int', default: 0 })
  awayScore: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Team, (team) => team.homeMatches, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'homeTeamId' })
  homeTeam: Relation<Team>;

  @ManyToOne(() => Team, (team) => team.awayMatches, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'awayTeamId' })
  awayTeam: Relation<Team>;

  @OneToMany(() => MatchLineup, (lineup) => lineup.match)
  lineups: MatchLineup[];

  @OneToMany(() => MatchEvent, (event) => event.match)
  events: MatchEvent[];
}