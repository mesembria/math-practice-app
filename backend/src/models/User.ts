import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { ExerciseSession } from "./ExerciseSession";
import { ProblemStatistic } from "./ProblemStatistic";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'boolean', default: false })
  is_parent!: boolean;

  @Column({ type: 'int', default: 1 })
  current_level!: number;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => ExerciseSession, session => session.user)
  sessions!: ExerciseSession[];

  @OneToMany(() => ProblemStatistic, statistic => statistic.user)
  statistics!: ProblemStatistic[];
}