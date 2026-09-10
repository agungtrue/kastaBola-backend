import { MigrationInterface, QueryRunner } from "typeorm";

export class InitIdentityModule1788798746908 implements MigrationInterface {
    name = 'InitIdentityModule1788798746908'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_c5505de389fa5fca7ddce29fa49"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7f77b33065553b386625c4e052"`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "awayTeamId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "awayTeamId" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_7f77b33065553b386625c4e052" ON "matches"  ("awayTeamId", "status", "createdAt") `);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_c5505de389fa5fca7ddce29fa49" FOREIGN KEY ("awayTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_c5505de389fa5fca7ddce29fa49"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7f77b33065553b386625c4e052"`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "awayTeamId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "awayTeamId" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_7f77b33065553b386625c4e052" ON "matches" USING btree ("status", "awayTeamId", "createdAt") `);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_c5505de389fa5fca7ddce29fa49" FOREIGN KEY ("awayTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
