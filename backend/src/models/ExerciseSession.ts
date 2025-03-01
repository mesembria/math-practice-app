import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { IExerciseSession, IUser, IProblemAttempt } from "./types";

@Entity("exercise_sessions")
export class ExerciseSession implements IExerciseSession {
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

  @ManyToOne("User", "sessions")
  @JoinColumn({ name: "user_id" })
  user: IUser;

  @OneToMany("ProblemAttempt", "session")
  attempts: IProblemAttempt[];
}
