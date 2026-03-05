import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "./User";

@Entity("match_performances")
export class MatchPerformance {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, (user) => user.matchPerformances, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ type: "date" })
    matchDate!: string;

    @Column()
    opponent!: string;

    // Batting stats
    @Column({ type: "int", default: 0 })
    runsScored!: number;

    @Column({ type: "int", default: 0 })
    ballsFaced!: number;

    @Column({ type: "int", default: 0 })
    fours!: number;

    @Column({ type: "int", default: 0 })
    sixes!: number;

    @Column({ type: "boolean", default: true })
    isDismissed!: boolean;

    // Bowling stats
    @Column({ type: "int", default: 0 })
    ballsBowled!: number; // Storing balls to avoid overs decimal conversion issues

    @Column({ type: "int", default: 0 })
    runsConceded!: number;

    @Column({ type: "int", default: 0 })
    wicketsTaken!: number;

    @Column({ type: "int", default: 0 })
    maidens!: number;

    // Fielding stats
    @Column({ type: "int", default: 0 })
    catches!: number;

    @Column({ type: "int", default: 0 })
    stumpings!: number;

    @CreateDateColumn()
    createdAt!: Date;
}
