import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("coach_profiles")
export class CoachProfile {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @OneToOne(() => User, (user) => user.coachProfile, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ nullable: true })
    specialization!: string;

    @Column({ nullable: true, type: "int" })
    experienceYears!: number;
}
