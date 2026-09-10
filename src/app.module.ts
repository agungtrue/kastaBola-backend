import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { createObserveModule } from '@nestjs/observe';
import { envValidationSchema } from './config/env.validation.js';
import { dataSourceOptions } from './database/data-source.js';

import { AppController } from './app.controller.js';
import { TeamsController } from './modules/teams/teams.controller.js';
import { PlayersController } from './modules/players/players.controller.js';

import { AppService } from './app.service.js';
import { TeamsService } from './modules/teams/teams.service.js';
import { PlayersService } from './modules/players/players.service.js';

import { AuthModule } from './modules/auth/auth.module.js';
import { TeamsModule } from './modules/teams/teams.module.js';
import { PlayersModule } from './modules/players/players.module.js';
import { MatchesModule } from './modules/matches/matches.module.js';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module.js';
import { AnalyticsModule } from './modules/analytics/analytics.module.js';

// export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // ObserveModule.forRoot({
    //   appKey: process.env.OBSERVE_APP_KEY || 'YOUR_APP_KEY',
    //   appSecret: process.env.OBSERVE_APP_SECRET || 'YOUR_APP_SECRET',
    //   serviceId: 'kastabola-backend',
    // }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        ...dataSourceOptions,
        entities: [],
        migrations: [],
        autoLoadEntities: true,
      }),
    }),
    AuthModule,
    TeamsModule,
    PlayersModule,
    MatchesModule,
    LeaderboardModule,
    AnalyticsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}