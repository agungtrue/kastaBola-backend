import { MigrationInterface, QueryRunner } from "typeorm";

export class InitIdentityModule1788972903728 implements MigrationInterface {
    name = 'InitIdentityModule1788972903728'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customers" ADD "teamId" uuid`);
        await queryRunner.query(`ALTER TYPE "public"."customers_default_role_enum" ADD VALUE 'CAPTAIN'`);
        await queryRunner.query(`ALTER TYPE "public"."customers_default_role_enum" ADD VALUE 'REFEREE'`);
        await queryRunner.query(`ALTER TYPE "public"."customers_default_role_enum" ADD VALUE 'VENUE_OWNER'`);
        await queryRunner.query(`CREATE INDEX "IDX_637fd762d1cba8781ca97b0e80" ON "customers"  ("teamId", "is_active", "phone") `);
        await queryRunner.query(`CREATE INDEX "IDX_66323cdeb3ec5e86302918f7d9" ON "customers"  ("teamId", "is_active", "email") `);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_5fe194e93e093c0267b08fb9bc8" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_5fe194e93e093c0267b08fb9bc8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_66323cdeb3ec5e86302918f7d9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_637fd762d1cba8781ca97b0e80"`);
        await queryRunner.query(`CREATE TYPE "public"."customers_default_role_enum_old" AS ENUM('PLAYER', 'MANAGER', 'OFFICIAL')`);
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "default_role" TYPE "public"."customers_default_role_enum_old" USING "default_role"::"text"::"public"."customers_default_role_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."customers_default_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."customers_default_role_enum_old" RENAME TO "customers_default_role_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."customers_default_role_enum_old" AS ENUM('PLAYER', 'MANAGER', 'OFFICIAL')`);
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "default_role" TYPE "public"."customers_default_role_enum_old" USING "default_role"::"text"::"public"."customers_default_role_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."customers_default_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."customers_default_role_enum_old" RENAME TO "customers_default_role_enum"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "teamId"`);
    }

}
