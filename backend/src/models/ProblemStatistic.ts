import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, UpdateDateColumn } from "typeorm";
import { IProblemStatistic, IUser } from "./types";

@Entity("problem_statistics")
@Unique(["user_id", "factor1", "factor2"])
export class ProblemStatistic implements IProblemStatistic {
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

  @UpdateDateColumn()
  last_attempt_at: Date;

  @ManyToOne("User", "statistics")
  @JoinColumn({ name: "user_id" })
  user: IUser;
}
