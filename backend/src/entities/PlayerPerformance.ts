import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity("player_performance")
export class PlayerPerformance {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @OneToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn()
    user!: User;

    @Column({ type: "int", default: 0 })
    matchesPlayed!: number;

    @Column({ type: "int", default: 0 })
    totalRuns!: number;

    @Column({ type: "int", default: 0 })
    highestScore!: number;

    // Batting average can be decimal
    @Column({ type: "decimal", precision: 5, scale: 2, default: 0.00 })
    battingAverage!: number;

    @Column({ type: "decimal", precision: 5, scale: 2, default: 0.00 })
    strikeRate!: number;

    @Column({ type: "int", default: 0 })
    hundreds!: number;

    @Column({ type: "int", default: 0 })
    fifties!: number;

    @Column({ type: "int", default: 0 })
    totalWickets!: number;

    @Column({ type: "decimal", precision: 5, scale: 2, default: 0.00 })
    bowlingAverage!: number;

    @Column({ type: "decimal", precision: 5, scale: 2, default: 0.00 })
    economyRate!: number;

    @Column({ type: "int", default: 0 })
    fiveWicketHauls!: number;

    @Column({ type: "int", default: 0 })
    catches!: number;

    @Column({ type: "int", default: 0 })
    stumpings!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
