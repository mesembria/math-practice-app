import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingOperandSupport1713000000000 implements MigrationInterface {
    name = 'AddMissingOperandSupport1713000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log("Running AddMissingOperandSupport migration...");
        
        // Check if column exists before adding it
        const problemAttemptsTable = await queryRunner.query(
          "PRAGMA table_info('problem_attempts')"
        );
        const hasMissingOperandPosition = problemAttemptsTable.some(
          (column: { name: string }) => column.name === 'missing_operand_position'
        );
        
        if (!hasMissingOperandPosition) {
            // 1. Add missing_operand_position to problem_attempts table
            await queryRunner.query(`
                ALTER TABLE "problem_attempts" 
                ADD COLUMN "missing_operand_position" varchar NULL
            `);
            console.log("Added missing_operand_position to problem_attempts");
        }

        // Similarly check before adding to problem_states
        const problemStatesTable = await queryRunner.query(
          "PRAGMA table_info('problem_states')"
        );
        const hasMissingOperandPositionStates = problemStatesTable.some(
          (column: { name: string }) => column.name === 'missing_operand_position'
        );
        
        if (!hasMissingOperandPositionStates) {
            // 2. Add missing_operand_position to problem_states table
            await queryRunner.query(`
                ALTER TABLE "problem_states" 
                ADD COLUMN "missing_operand_position" varchar NULL
            `);
            console.log("Added missing_operand_position to problem_states");
        }

        // Check for existing index before dropping
        const statesIndices = await queryRunner.query(
          "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='problem_states'"
        );
        const hasOldStatesIndex = statesIndices.some(
          (idx: { name: string }) => idx.name === 'IDX_problem_states_user_factors'
        );
        
        if (hasOldStatesIndex) {
            // 3. Update unique constraint in problem_states table
            await queryRunner.query(`
                DROP INDEX "IDX_problem_states_user_factors"
            `);
            console.log("Dropped old problem_states index");
        }
        
        // Creating new index
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_problem_states_user_factors_complete" 
            ON "problem_states" ("user_id", "factor1", "factor2", "problem_type", "missing_operand_position")
        `);
        console.log("Created new problem_states index");

        // Check for statistics column
        const problemStatsTable = await queryRunner.query(
          "PRAGMA table_info('problem_statistics')"
        );
        const hasMissingOperandPositionStats = problemStatsTable.some(
          (column: { name: string }) => column.name === 'missing_operand_position'
        );
        
        if (!hasMissingOperandPositionStats) {
            // 4. Add missing_operand_position to problem_statistics table
            await queryRunner.query(`
                ALTER TABLE "problem_statistics" 
                ADD COLUMN "missing_operand_position" varchar NULL
            `);
            console.log("Added missing_operand_position to problem_statistics");
        }

        // Check for existing statistics index
        const statsIndices = await queryRunner.query(
          "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='problem_statistics'"
        );
        const hasOldStatsIndex = statsIndices.some(
          (idx: { name: string }) => idx.name === 'IDX_problem_statistics_user_factors_type'
        );
        
        if (hasOldStatsIndex) {
            // 5. Update unique constraint in problem_statistics table
            await queryRunner.query(`
                DROP INDEX "IDX_problem_statistics_user_factors_type"
            `);
            console.log("Dropped old problem_statistics index");
        }
        
        // Creating new index
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_problem_statistics_user_factors_complete" 
            ON "problem_statistics" ("user_id", "factor1", "factor2", "problem_type", "missing_operand_position")
        `);
        console.log("Created new problem_statistics index");
        console.log("AddMissingOperandSupport migration completed successfully");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log("Reverting AddMissingOperandSupport migration...");
        
        // 5. Restore original constraint for problem_statistics
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_problem_statistics_user_factors_complete"
        `);
        
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_problem_statistics_user_factors_type" 
            ON "problem_statistics" ("user_id", "factor1", "factor2", "problem_type")
        `);
        
        // 4. Remove missing_operand_position from problem_statistics
        await queryRunner.query(`
            ALTER TABLE "problem_statistics" DROP COLUMN "missing_operand_position"
        `);

        // 3. Restore original constraint for problem_states
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_problem_states_user_factors_complete"
        `);
        
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_problem_states_user_factors" 
            ON "problem_states" ("user_id", "factor1", "factor2")
        `);
        
        // 2. Remove missing_operand_position from problem_states
        await queryRunner.query(`
            ALTER TABLE "problem_states" DROP COLUMN "missing_operand_position"
        `);
        
        // 1. Remove missing_operand_position from problem_attempts
        await queryRunner.query(`
            ALTER TABLE "problem_attempts" DROP COLUMN "missing_operand_position"
        `);
        
        console.log("AddMissingOperandSupport migration reverted successfully");
    }
}