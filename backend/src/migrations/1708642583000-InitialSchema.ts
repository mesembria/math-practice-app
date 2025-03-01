import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1708642583000 implements MigrationInterface {
    name = 'InitialSchema1708642583000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" INTEGER PRIMARY KEY AUTOINCREMENT,
                "name" TEXT NOT NULL,
                "is_parent" BOOLEAN NOT NULL DEFAULT (0),
                "created_at" DATETIME NOT NULL DEFAULT (datetime('now'))
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "exercise_sessions" (
                "id" INTEGER PRIMARY KEY AUTOINCREMENT,
                "user_id" INTEGER NOT NULL,
                "start_time" DATETIME NOT NULL DEFAULT (datetime('now')),
                "end_time" DATETIME,
                "total_problems" INTEGER NOT NULL,
                "completed_problems" INTEGER DEFAULT (0),
                "is_completed" BOOLEAN DEFAULT (0),
                FOREIGN KEY ("user_id") REFERENCES "users" ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "problem_attempts" (
                "id" INTEGER PRIMARY KEY AUTOINCREMENT,
                "session_id" INTEGER NOT NULL,
                "factor1" INTEGER NOT NULL,
                "factor2" INTEGER NOT NULL,
                "user_answer" INTEGER,
                "is_correct" BOOLEAN,
                "response_time_ms" INTEGER,
                "attempt_number" INTEGER DEFAULT (1),
                "created_at" DATETIME NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY ("session_id") REFERENCES "exercise_sessions" ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "problem_statistics" (
                "id" INTEGER PRIMARY KEY AUTOINCREMENT,
                "user_id" INTEGER NOT NULL,
                "factor1" INTEGER NOT NULL,
                "factor2" INTEGER NOT NULL,
                "total_attempts" INTEGER DEFAULT (0),
                "correct_attempts" INTEGER DEFAULT (0),
                "avg_response_time_ms" INTEGER DEFAULT (0),
                "last_attempt_at" DATETIME NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY ("user_id") REFERENCES "users" ("id"),
                UNIQUE("user_id", "factor1", "factor2")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "problem_statistics"`);
        await queryRunner.query(`DROP TABLE "problem_attempts"`);
        await queryRunner.query(`DROP TABLE "exercise_sessions"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
