import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Player } from '../../players/entities/player.entity.js';
import { Match } from '../../matches/entities/match.entity.js';

@Entity('teams')
@Index(['eloRating'])
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 10 })
  shortCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  homeground: string;

  @Column({ type: 'int', default: 1600 })
  eloRating: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 120, unique: true })
  publicSlug: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  establishedYear: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  captainPhone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Player, (player) => player.team)
  players: Player[];

  @OneToMany(() => Match, (match) => match.homeTeam)
  homeMatches: Match[];

  @OneToMany(() => Match, (match) => match.awayTeam)
  awayMatches: Match[];
}