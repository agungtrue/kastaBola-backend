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
import { PlayerPosition } from '../../../common/enums/identity.enum.js';
import { MatchLineup } from '../../matches/entities/match-lineup.entity.js';

@Entity('players')
@Index(['teamId', 'isActive', 'number'])
@Index(['teamId', 'position'])
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  teamId: string;

  @Column({ type: 'int' })
  number: number;

  @Column({ type: 'varchar', length: 120 })
  fullName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nickname: string;

  @Column({ type: 'enum', enum: PlayerPosition, default: PlayerPosition.MF })
  position: PlayerPosition;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatarUrl: string;

  @Column({ type: 'boolean', default: false })
  isCaptain: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Team, (team) => team.players, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: Relation<Team>;

  @OneToMany(() => MatchLineup, (lineup) => lineup.player)
  lineups: MatchLineup[];
}