import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProblemType1711570980000 implements MigrationInterface {
    name = 'AddProblemType1711570980000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add problem_type column to problem_states table
        await queryRunner.query(`
            ALTER TABLE "problem_states" 
            ADD COLUMN "problem_type" varchar DEFAULT 'multiplication' NOT NULL
        `);

        // Add problem_type column to problem_attempts table
        await queryRunner.query(`
            ALTER TABLE "problem_attempts" 
            ADD COLUMN "problem_type" varchar DEFAULT 'multiplication' NOT NULL
        `);

        // Add problem_type column to problem_statistics table
        await queryRunner.query(`
            ALTER TABLE "problem_statistics" 
            ADD COLUMN "problem_type" varchar DEFAULT 'multiplication' NOT NULL
        `);
        
        // Drop the old unique constraint on problem_statistics
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_problem_statistics_user_factors"
        `);
        
        // Create a new unique constraint including problem_type
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_problem_statistics_user_factors_type" 
            ON "problem_statistics" ("user_id", "factor1", "factor2", "problem_type")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the new unique constraint
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_problem_statistics_user_factors_type"
        `);
        
        // Recreate the original unique constraint
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_problem_statistics_user_factors" 
            ON "problem_statistics" ("user_id", "factor1", "factor2")
        `);
        
        // Drop the problem_type columns
        await queryRunner.query(`ALTER TABLE "problem_statistics" DROP COLUMN "problem_type"`);
        await queryRunner.query(`ALTER TABLE "problem_attempts" DROP COLUMN "problem_type"`);
        await queryRunner.query(`ALTER TABLE "problem_states" DROP COLUMN "problem_type"`);
    }
}