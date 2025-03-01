import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserLevel1708642584000 implements MigrationInterface {
    name = 'AddUserLevel1708642584000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN "current_level" INTEGER NOT NULL DEFAULT (1)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "current_level"
        `);
    }
}
