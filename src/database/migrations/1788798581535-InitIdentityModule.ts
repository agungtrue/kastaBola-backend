import { MigrationInterface, QueryRunner } from "typeorm";

export class InitIdentityModule1788798581535 implements MigrationInterface {
    name = 'InitIdentityModule1788798581535'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_7640cbfcc0f126d47fcfa550c6"`);
        await queryRunner.query(`ALTER TYPE "public"."matches_mode_enum" RENAME TO "matches_mode_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."matches_mode_enum" AS ENUM('SPARING', 'FUNGAME', 'TOURNAMENT', 'KNOCKOUT')`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "mode" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "mode" TYPE "public"."matches_mode_enum" USING "mode"::"text"::"public"."matches_mode_enum"`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "mode" SET DEFAULT 'SPARING'`);
        await queryRunner.query(`DROP TYPE "public"."matches_mode_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."matches_mode_enum" RENAME TO "matches_mode_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."matches_mode_enum" AS ENUM('SPARING', 'FUNGAME', 'TOURNAMENT', 'KNOCKOUT')`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "mode" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "mode" TYPE "public"."matches_mode_enum" USING "mode"::"text"::"public"."matches_mode_enum"`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "mode" SET DEFAULT 'SPARING'`);
        await queryRunner.query(`DROP TYPE "public"."matches_mode_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_7640cbfcc0f126d47fcfa550c6" ON "matches"  ("mode", "status", "createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_7640cbfcc0f126d47fcfa550c6"`);
        await queryRunner.query(`CREATE TYPE "public"."matches_mode_enum_old" AS ENUM('sparing', 'fungame', 'tournament', 'knockout')`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "mode" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "mode" TYPE "public"."matches_mode_enum_old" USING "mode"::"text"::"public"."matches_mode_enum_old"`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "mode" SET DEFAULT 'sparing'`);
        await queryRunner.query(`DROP TYPE "public"."matches_mode_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."matches_mode_enum_old" RENAME TO "matches_mode_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."matches_mode_enum_old" AS ENUM('sparing', 'fungame', 'tournament', 'knockout')`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "mode" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "mode" TYPE "public"."matches_mode_enum_old" USING "mode"::"text"::"public"."matches_mode_enum_old"`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "mode" SET DEFAULT 'sparing'`);
        await queryRunner.query(`DROP TYPE "public"."matches_mode_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."matches_mode_enum_old" RENAME TO "matches_mode_enum"`);
        await queryRunner.query(`CREATE INDEX "IDX_7640cbfcc0f126d47fcfa550c6" ON "matches" USING btree ("mode", "status", "createdAt") `);
    }

}
