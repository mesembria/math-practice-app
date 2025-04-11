import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProblemTypeToSessions1712580000000 implements MigrationInterface {
    name = 'AddProblemTypeToSessions1712580000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add problem_type column to exercise_sessions table
        await queryRunner.query(`
            ALTER TABLE "exercise_sessions" 
            ADD COLUMN "problem_type" varchar DEFAULT 'multiplication'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the column if the migration needs to be reverted
        await queryRunner.query(`ALTER TABLE "exercise_sessions" DROP COLUMN "problem_type"`);
    }
}