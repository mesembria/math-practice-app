// src/models/ProblemStatistic.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn, Index } from "typeorm";
import { User } from "./User";

@Entity("problem_statistics")
@Index("IDX_problem_statistics_complete", ["user_id", "factor1", "factor2", "problem_type", "missing_operand_position"], { unique: true })
export class ProblemStatistic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  factor1: number;

  @Column()
  factor2: number;

  @Column({ default: 0 })
  total_attempts: number;

  @Column({ default: 0 })
  correct_attempts: number;

  @Column({ default: 0 })
  avg_response_time_ms: number;
  
  @Column({ name: "problem_type", default: "multiplication" })
  problem_type: string;

  @Column({ name: "missing_operand_position", type: "varchar", nullable: true })
  missing_operand_position: string | null; 

  @UpdateDateColumn()
  last_attempt_at: Date;

  @ManyToOne(() => User, user => user.statistics)
  @JoinColumn({ name: "user_id" })
  user: User;
}