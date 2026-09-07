import { MigrationInterface, QueryRunner } from "typeorm";

export class InitIdentityModule1788693502714 implements MigrationInterface {
    name = 'InitIdentityModule1788693502714'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_c25e4080fc3803e05200d85a5d" ON "match_events"  ("assistPlayerId", "type") `);
        await queryRunner.query(`CREATE INDEX "IDX_d97f2ef60b2b87198225630d0a" ON "match_events"  ("scorerPlayerId", "type") `);
        await queryRunner.query(`CREATE INDEX "IDX_1bedc8d908067869a839811813" ON "match_events"  ("matchId", "minute") `);
        await queryRunner.query(`CREATE INDEX "IDX_435d45a42ccf48c8ed34da9e49" ON "matches"  ("matchPin") `);
        await queryRunner.query(`CREATE INDEX "IDX_7f77b33065553b386625c4e052" ON "matches"  ("awayTeamId", "status", "createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_f467ff96d98fc77b272edc8e0c" ON "matches"  ("homeTeamId", "status", "createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_7640cbfcc0f126d47fcfa550c6" ON "matches"  ("mode", "status", "createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_b77c8adf097f55af3a4f5d708a" ON "match_lineups"  ("playerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4a465608651fe2766b1fff6d79" ON "match_lineups"  ("matchId", "teamId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ea0b38b84dca664f008d4afe2d" ON "players"  ("teamId", "position") `);
        await queryRunner.query(`CREATE INDEX "IDX_13d3dcc9311010d3a24d4d2979" ON "players"  ("teamId", "isActive", "number") `);
        await queryRunner.query(`CREATE INDEX "IDX_48c0c32e6247a2de155baeaf98" ON "teams"  ("name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fdedda2d1d3f0eaace1119a7b4" ON "teams"  ("publicSlug") `);
        await queryRunner.query(`CREATE INDEX "IDX_136de6c3e867d7fb483ad86648" ON "teams"  ("eloRating") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_136de6c3e867d7fb483ad86648"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fdedda2d1d3f0eaace1119a7b4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_48c0c32e6247a2de155baeaf98"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_13d3dcc9311010d3a24d4d2979"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ea0b38b84dca664f008d4afe2d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4a465608651fe2766b1fff6d79"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b77c8adf097f55af3a4f5d708a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7640cbfcc0f126d47fcfa550c6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f467ff96d98fc77b272edc8e0c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7f77b33065553b386625c4e052"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_435d45a42ccf48c8ed34da9e49"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1bedc8d908067869a839811813"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d97f2ef60b2b87198225630d0a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c25e4080fc3803e05200d85a5d"`);
    }

}
