import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("player_profiles")
export class PlayerProfile {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @OneToOne(() => User, (user) => user.playerProfile, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ nullable: true })
    dateOfBirth!: string;

    @Column({ nullable: true })
    battingStyle!: string;

    @Column({ nullable: true })
    bowlingStyle!: string;

    @Column({ nullable: true })
    preferredPosition!: string;

    @Column({ default: 0 })
    totalBookings!: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    totalSpent!: number;

    @Column({ nullable: true })
    address!: string;

    @Column({ nullable: true })
    emergencyContact!: string;
}
