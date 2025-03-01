import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { IProblemAttempt, IExerciseSession } from "./types";

@Entity("problem_attempts")
export class ProblemAttempt implements IProblemAttempt {
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

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne("ExerciseSession", "attempts")
  @JoinColumn({ name: "session_id" })
  session: IExerciseSession;
}
