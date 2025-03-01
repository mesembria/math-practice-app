import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate, Check } from "typeorm";
import { User } from "./User";

@Entity("problem_states")
@Check(`"factor1" <= "factor2"`) // Enforces normalization at database level
export class ProblemState {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "user_id" })
    userId: number;

    @Column()
    factor1: number;

    @Column()
    factor2: number;

    @Column({ type: "float", default: 10 })
    weight: number;

    @Column({ name: "last_seen", type: "bigint", default: 0 })
    lastSeen: number;

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
