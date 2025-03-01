import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { IUser, IExerciseSession, IProblemStatistic } from "./types";

@Entity("users")
export class User implements IUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: false })
  is_parent: boolean;

  @Column({ default: 1 })
  current_level: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany("ExerciseSession", "user")
  sessions: IExerciseSession[];

  @OneToMany("ProblemStatistic", "user")
  statistics: IProblemStatistic[];
}
