// src/models/ExerciseSession.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./User";
import { ProblemAttempt } from "./ProblemAttempt";

@Entity("exercise_sessions")
export class ExerciseSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @CreateDateColumn()
  start_time: Date;

  @Column({ nullable: true })
  end_time: Date;

  @Column()
  total_problems: number;

  @Column({ default: 0 })
  completed_problems: number;

  @Column({ default: false })
  is_completed: boolean;
  
  @Column({ name: "problem_type", type: "varchar", nullable: true, default: "multiplication" })
  problem_type: string;

  @ManyToOne(() => User, user => user.sessions)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => ProblemAttempt, attempt => attempt.session)
  attempts: ProblemAttempt[];
}