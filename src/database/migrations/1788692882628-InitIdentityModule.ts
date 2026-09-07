import { MigrationInterface, QueryRunner } from "typeorm";

export class InitIdentityModule1788692882628 implements MigrationInterface {
    name = 'InitIdentityModule1788692882628'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."match_events_teamside_enum" AS ENUM('home', 'away')`);
        await queryRunner.query(`CREATE TYPE "public"."match_events_type_enum" AS ENUM('GOAL', 'CARD')`);
        await queryRunner.query(`CREATE TYPE "public"."match_events_cardtype_enum" AS ENUM('yellow', 'red')`);
        await queryRunner.query(`CREATE TABLE "match_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "matchId" uuid NOT NULL, "teamSide" "public"."match_events_teamside_enum" NOT NULL, "minute" integer NOT NULL, "type" "public"."match_events_type_enum" NOT NULL, "cardType" "public"."match_events_cardtype_enum", "scorerPlayerId" uuid, "assistPlayerId" uuid, "targetPlayerId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_34160ac79fb420bdc42a6b24854" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."matches_mode_enum" AS ENUM('sparing', 'fungame', 'tournament', 'knockout')`);
        await queryRunner.query(`CREATE TYPE "public"."matches_status_enum" AS ENUM('WAITING_ACCEPTANCE', 'SCHEDULED', 'LIVE', 'FINISHED')`);
        await queryRunner.query(`CREATE TABLE "matches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "mode" "public"."matches_mode_enum" NOT NULL DEFAULT 'sparing', "status" "public"."matches_status_enum" NOT NULL DEFAULT 'WAITING_ACCEPTANCE', "homeTeamId" uuid NOT NULL, "awayTeamId" uuid NOT NULL, "matchPin" character varying(6), "refereeToken" character varying(100), "matchDuration" integer NOT NULL DEFAULT '15', "bufferDuration" integer NOT NULL DEFAULT '5', "startTime" character varying(10) NOT NULL DEFAULT '19:00', "venueName" character varying(255), "refereeName" character varying(120), "homeScore" integer NOT NULL DEFAULT '0', "awayScore" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_5bf5d833da1d6f388bfe7b10935" UNIQUE ("refereeToken"), CONSTRAINT "PK_8a22c7b2e0828988d51256117f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."match_lineups_position_enum" AS ENUM('GK', 'DF', 'MF', 'FW')`);
        await queryRunner.query(`CREATE TABLE "match_lineups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "matchId" uuid NOT NULL, "teamId" uuid NOT NULL, "playerId" uuid NOT NULL, "position" "public"."match_lineups_position_enum" NOT NULL, "isCaptain" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d6fad9e29d4cb6ee1a143e620db" UNIQUE ("matchId", "playerId"), CONSTRAINT "PK_79de52f107f93cca28a6929329c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."players_position_enum" AS ENUM('GK', 'DF', 'MF', 'FW')`);
        await queryRunner.query(`CREATE TABLE "players" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "teamId" uuid NOT NULL, "number" integer NOT NULL, "fullName" character varying(120) NOT NULL, "nickname" character varying(50), "position" "public"."players_position_enum" NOT NULL DEFAULT 'MF', "avatarUrl" character varying(255), "isCaptain" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "shortCode" character varying(10) NOT NULL, "homeground" character varying(255), "eloRating" integer NOT NULL DEFAULT '1600', "publicSlug" character varying(120) NOT NULL, "establishedYear" character varying(10), "captainPhone" character varying(20), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fdedda2d1d3f0eaace1119a7b49" UNIQUE ("publicSlug"), CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "match_events" ADD CONSTRAINT "FK_272a2f96fa5c7d89b8c362af058" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_events" ADD CONSTRAINT "FK_62486e9b63b7c8d8e99ae0672d3" FOREIGN KEY ("scorerPlayerId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_events" ADD CONSTRAINT "FK_93b7e956ad95e2496a3a57b24e5" FOREIGN KEY ("assistPlayerId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_events" ADD CONSTRAINT "FK_2eaade983f83a6f7cd11a207232" FOREIGN KEY ("targetPlayerId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_999a74ecaebaf96816112445a09" FOREIGN KEY ("homeTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_c5505de389fa5fca7ddce29fa49" FOREIGN KEY ("awayTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_lineups" ADD CONSTRAINT "FK_7706ccd3ef1ff56c818a7b246a1" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_lineups" ADD CONSTRAINT "FK_93e7a302dbdebcd24ef4c7ff981" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_lineups" ADD CONSTRAINT "FK_b77c8adf097f55af3a4f5d708a7" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "players" ADD CONSTRAINT "FK_ecaf0c4aabc76f1a3d1a91ea33c" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "players" DROP CONSTRAINT "FK_ecaf0c4aabc76f1a3d1a91ea33c"`);
        await queryRunner.query(`ALTER TABLE "match_lineups" DROP CONSTRAINT "FK_b77c8adf097f55af3a4f5d708a7"`);
        await queryRunner.query(`ALTER TABLE "match_lineups" DROP CONSTRAINT "FK_93e7a302dbdebcd24ef4c7ff981"`);
        await queryRunner.query(`ALTER TABLE "match_lineups" DROP CONSTRAINT "FK_7706ccd3ef1ff56c818a7b246a1"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_c5505de389fa5fca7ddce29fa49"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_999a74ecaebaf96816112445a09"`);
        await queryRunner.query(`ALTER TABLE "match_events" DROP CONSTRAINT "FK_2eaade983f83a6f7cd11a207232"`);
        await queryRunner.query(`ALTER TABLE "match_events" DROP CONSTRAINT "FK_93b7e956ad95e2496a3a57b24e5"`);
        await queryRunner.query(`ALTER TABLE "match_events" DROP CONSTRAINT "FK_62486e9b63b7c8d8e99ae0672d3"`);
        await queryRunner.query(`ALTER TABLE "match_events" DROP CONSTRAINT "FK_272a2f96fa5c7d89b8c362af058"`);
        await queryRunner.query(`DROP TABLE "teams"`);
        await queryRunner.query(`DROP TABLE "players"`);
        await queryRunner.query(`DROP TYPE "public"."players_position_enum"`);
        await queryRunner.query(`DROP TABLE "match_lineups"`);
        await queryRunner.query(`DROP TYPE "public"."match_lineups_position_enum"`);
        await queryRunner.query(`DROP TABLE "matches"`);
        await queryRunner.query(`DROP TYPE "public"."matches_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."matches_mode_enum"`);
        await queryRunner.query(`DROP TABLE "match_events"`);
        await queryRunner.query(`DROP TYPE "public"."match_events_cardtype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."match_events_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."match_events_teamside_enum"`);
    }

}
