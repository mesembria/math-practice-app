// src/models/ProblemAttempt.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { ExerciseSession } from "./ExerciseSession";

@Entity("problem_attempts")
export class ProblemAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  session_id: number;

  @Column()
  factor1: number;

  @Column()
  factor2: number;

  @Column({ nullable: true })
  user_answer: number;

  @Column({ nullable: true })
  is_correct: boolean;

  @Column({ nullable: true })
  response_time_ms: number;

  @Column({ default: 1 })
  attempt_number: number;
  
  @Column({ name: "problem_type", type: "varchar", default: "multiplication" })
  problem_type: string;
  
  @Column({ name: "missing_operand_position", type: "varchar", nullable: true })
  missing_operand_position: string | null;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => ExerciseSession, session => session.attempts)
  @JoinColumn({ name: "session_id" })
  session: ExerciseSession;
}