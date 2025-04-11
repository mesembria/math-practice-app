import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class RebuildProblemStatisticsTable1713200000000 implements MigrationInterface {
    name = 'RebuildProblemStatisticsTable1713200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log("Running RebuildProblemStatisticsTable migration...");
        
        // 1. Backup existing data
        await queryRunner.query(`
            CREATE TABLE "problem_statistics_backup" AS 
            SELECT * FROM "problem_statistics"
        `);
        
        console.log("Created backup of problem_statistics table");
        
        // 2. Drop the existing table
        await queryRunner.query(`DROP TABLE "problem_statistics"`);
        
        console.log("Dropped original problem_statistics table");
        
        // 3. Create a new table with the correct constraints
        await queryRunner.createTable(
            new Table({
                name: "problem_statistics",
                columns: [
                    {
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "user_id",
                        type: "integer"
                    },
                    {
                        name: "factor1",
                        type: "integer"
                    },
                    {
                        name: "factor2",
                        type: "integer"
                    },
                    {
                        name: "total_attempts",
                        type: "integer",
                        default: 0
                    },
                    {
                        name: "correct_attempts",
                        type: "integer",
                        default: 0
                    },
                    {
                        name: "avg_response_time_ms",
                        type: "integer",
                        default: 0
                    },
                    {
                        name: "problem_type",
                        type: "varchar",
                        default: "'multiplication'"
                    },
                    {
                        name: "missing_operand_position",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "last_attempt_at",
                        type: "datetime",
                        default: "datetime('now')"
                    }
                ],
                indices: [
                    {
                        name: "IDX_problem_statistics_complete",
                        columnNames: ["user_id", "factor1", "factor2", "problem_type", "missing_operand_position"],
                        isUnique: true
                    }
                ],
                foreignKeys: [
                    {
                        columnNames: ["user_id"],
                        referencedTableName: "users",
                        referencedColumnNames: ["id"]
                    }
                ]
            }),
            true
        );
        
        console.log("Created new problem_statistics table with proper constraints");
        
        // 4. Restore data with deduplication logic
        await queryRunner.query(`
            INSERT INTO "problem_statistics" (
                "id", "user_id", "factor1", "factor2", "total_attempts", 
                "correct_attempts", "avg_response_time_ms", "problem_type", 
                "missing_operand_position", "last_attempt_at"
            )
            SELECT 
                "id", "user_id", "factor1", "factor2", "total_attempts", 
                "correct_attempts", "avg_response_time_ms", "problem_type", 
                "missing_operand_position", "last_attempt_at"
            FROM "problem_statistics_backup"
            GROUP BY "user_id", "factor1", "factor2", "problem_type", "missing_operand_position"
        `);
        
        console.log("Restored data from backup");
        
        // 5. Drop the backup table
        await queryRunner.query(`DROP TABLE "problem_statistics_backup"`);
        
        console.log("RebuildProblemStatisticsTable migration completed successfully");
    }

    public async down(): Promise<void> {
        console.log("This migration cannot be reverted as it rebuilds the table schema.");
        console.log("If you need to revert, restore from a database backup.");
    }
}