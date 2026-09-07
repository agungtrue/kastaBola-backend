import { MigrationInterface, QueryRunner } from "typeorm";

export class InitIdentityModule1788618511008 implements MigrationInterface {
    name = 'InitIdentityModule1788618511008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "password_resets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "token_hash" character varying(255) NOT NULL, "is_used" boolean NOT NULL DEFAULT false, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4816377aa98211c1de34469e742" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7e57f540b334d522f9cf5b16ca" ON "password_resets"  ("email") `);
        await queryRunner.query(`CREATE TYPE "public"."customers_default_role_enum" AS ENUM('PLAYER', 'MANAGER', 'OFFICIAL')`);
        await queryRunner.query(`CREATE TYPE "public"."customers_gender_enum" AS ENUM('MALE', 'FEMALE')`);
        await queryRunner.query(`CREATE TYPE "public"."customers_preferred_position_enum" AS ENUM('GK', 'DF', 'MF', 'FW')`);
        await queryRunner.query(`CREATE TYPE "public"."customers_dominant_foot_enum" AS ENUM('LEFT', 'RIGHT', 'BOTH')`);
        await queryRunner.query(`CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "email" character varying(255) NOT NULL, "phone" character varying(20), "password_hash" character varying(255) NOT NULL, "full_name" character varying(100) NOT NULL, "nickname" character varying(50), "avatar_url" text, "default_role" "public"."customers_default_role_enum" NOT NULL DEFAULT 'PLAYER', "gender" "public"."customers_gender_enum" NOT NULL DEFAULT 'MALE', "birth_date" date, "preferred_position" "public"."customers_preferred_position_enum", "dominant_foot" "public"."customers_dominant_foot_enum", "region_id" bigint, "is_verified" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_8536b8b85c06969f84f0c098b03" UNIQUE ("email"), CONSTRAINT "UQ_88acd889fbe17d0e16cc4bc9174" UNIQUE ("phone"), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8536b8b85c06969f84f0c098b0" ON "customers"  ("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_88acd889fbe17d0e16cc4bc917" ON "customers"  ("phone") `);
        await queryRunner.query(`CREATE TABLE "customer_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_id" uuid NOT NULL, "refresh_token_hash" character varying(255) NOT NULL, "user_agent" text, "ip_address" character varying(45), "is_revoked" boolean NOT NULL DEFAULT false, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_82085a2a1850e02d40a965306ba" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_603f63d478610e2c71e15dffc5" ON "customer_tokens"  ("customer_id") `);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'CS')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "full_name" character varying(100) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'ADMIN', "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users"  ("email") `);
        await queryRunner.query(`ALTER TABLE "customer_tokens" ADD CONSTRAINT "FK_603f63d478610e2c71e15dffc57" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer_tokens" DROP CONSTRAINT "FK_603f63d478610e2c71e15dffc57"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_603f63d478610e2c71e15dffc5"`);
        await queryRunner.query(`DROP TABLE "customer_tokens"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_88acd889fbe17d0e16cc4bc917"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8536b8b85c06969f84f0c098b0"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP TYPE "public"."customers_dominant_foot_enum"`);
        await queryRunner.query(`DROP TYPE "public"."customers_preferred_position_enum"`);
        await queryRunner.query(`DROP TYPE "public"."customers_gender_enum"`);
        await queryRunner.query(`DROP TYPE "public"."customers_default_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7e57f540b334d522f9cf5b16ca"`);
        await queryRunner.query(`DROP TABLE "password_resets"`);
    }

}
