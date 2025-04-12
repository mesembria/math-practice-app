// src/models/ProblemState.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate, Check } from "typeorm";
import { User } from "./User";

@Entity("problem_states")
@Check(`"factor1" <= "factor2"`) // Enforces normalization at database level
export class ProblemState {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "user_id", type: "int" })
    userId: number;

    @Column({ type: "int" })
    factor1: number;

    @Column({ type: "int" })
    factor2: number;

    @Column({ type: "float", default: 10 })
    weight: number;

    @Column({ name: "last_seen", type: "bigint", default: 0 })
    lastSeen: number;
    
    @Column({ name: "problem_type", type: "varchar", default: "multiplication" })
    problemType: string;

    @Column({ name: "missing_operand_position", type: "varchar", nullable: true })
    missingOperandPosition: string | null;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;

    // This will ensure normalization at the entity level
    @BeforeInsert()
    @BeforeUpdate()
    ensureNormalization() {
        if (this.factor1 > this.factor2) {
            // Swap the factors to ensure factor1 <= factor2
            [this.factor1, this.factor2] = [this.factor2, this.factor1];
        }
    }
}