import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddProblemStates1708642585000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "problem_states",
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
                        type: "integer",
                        comment: "Always stores the smaller factor"
                    },
                    {
                        name: "factor2",
                        type: "integer",
                        comment: "Always stores the larger factor"
                    },
                    {
                        name: "weight",
                        type: "float",
                        default: 10 // Default weight for new problems
                    },
                    {
                        name: "last_seen",
                        type: "bigint",
                        default: 0
                    }
                ],
                indices: [
                    {
                        name: "IDX_problem_states_user_factors",
                        columnNames: ["user_id", "factor1", "factor2"],
                        isUnique: true
                    }
                ],
                foreignKeys: [
                    {
                        columnNames: ["user_id"],
                        referencedTableName: "users",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE"
                    }
                ]
            }),
            true
        );

        // Add a trigger to ensure factor1 <= factor2 (SQLite syntax)
        await queryRunner.query(`
            CREATE TRIGGER IF NOT EXISTS ensure_factor_order
            BEFORE INSERT ON problem_states
            FOR EACH ROW
            BEGIN
                SELECT CASE
                    WHEN NEW.factor1 > NEW.factor2 THEN
                        RAISE(ABORT, 'factor1 must be less than or equal to factor2')
                    END;
            END;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TRIGGER IF EXISTS ensure_factor_order`);
        await queryRunner.dropTable("problem_states");
    }
}