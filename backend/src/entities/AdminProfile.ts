import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("admin_profiles")
export class AdminProfile {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @OneToOne(() => User, (user) => user.adminProfile, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ nullable: true })
    department!: string;
}
