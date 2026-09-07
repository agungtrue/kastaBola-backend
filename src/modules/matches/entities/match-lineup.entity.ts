import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Match } from './match.entity.js';
import { Team } from '../../teams/entities/team.entity.js';
import { Player } from '../../players/entities/player.entity.js';
import { PlayerPosition } from '../../../common/enums/identity.enum.js';

@Entity('match_lineups')
@Unique(['matchId', 'playerId'])
@Index(['matchId', 'teamId'])
@Index(['playerId'])
export class MatchLineup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  matchId: string;

  @Column({ type: 'uuid' })
  teamId: string;

  @Column({ type: 'uuid' })
  playerId: string;

  @Column({ type: 'enum', enum: PlayerPosition })
  position: PlayerPosition;

  @Column({ type: 'boolean', default: false })
  isCaptain: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Match, (match) => match.lineups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matchId' })
  match: Relation<Match>;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: Relation<Team>;

  @ManyToOne(() => Player, (player) => player.lineups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playerId' })
  player: Relation<Player>;
}