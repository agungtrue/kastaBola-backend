import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { Match } from './match.entity.js';
import { Player } from '../../players/entities/player.entity.js';
import {
  MatchEventType,
  CardType,
  TeamSide,
} from '../../../common/enums/identity.enum.js';

@Entity('match_events')
@Index(['matchId', 'minute'])
@Index(['scorerPlayerId', 'type'])
@Index(['assistPlayerId', 'type'])
export class MatchEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  matchId: string;

  @Column({ type: 'enum', enum: TeamSide })
  teamSide: TeamSide;

  @Column({ type: 'int' })
  minute: number;

  @Column({ type: 'enum', enum: MatchEventType })
  type: MatchEventType;

  @Column({ type: 'enum', enum: CardType, nullable: true })
  cardType: CardType;

  @Column({ type: 'uuid', nullable: true })
  scorerPlayerId: string;

  @Column({ type: 'uuid', nullable: true })
  assistPlayerId: string;

  @Column({ type: 'uuid', nullable: true })
  targetPlayerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Match, (match) => match.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matchId' })
  match: Relation<Match>;

  @ManyToOne(() => Player, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'scorerPlayerId' })
  scorer: Relation<Player>;

  @ManyToOne(() => Player, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assistPlayerId' })
  assist: Relation<Player>;

  @ManyToOne(() => Player, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'targetPlayerId' })
  targetPlayer: Relation<Player>;
}