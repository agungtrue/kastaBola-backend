import { MigrationInterface, QueryRunner } from "typeorm";

export class InitIdentityModule1788974264244 implements MigrationInterface {
    name = 'InitIdentityModule1788974264244'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customers" RENAME COLUMN "default_role" TO "role"`);
        await queryRunner.query(`ALTER TYPE "public"."customers_default_role_enum" RENAME TO "customers_role_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."customers_role_enum" RENAME TO "customers_default_role_enum"`);
        await queryRunner.query(`ALTER TABLE "customers" RENAME COLUMN "role" TO "default_role"`);
    }

}
