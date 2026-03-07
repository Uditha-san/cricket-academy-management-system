import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "./User";

@Entity("guest_reviews")
export class GuestReview {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE", nullable: false })
    @JoinColumn({ name: "guest_id" })
    guest!: User;

    @Column({ type: "int" })
    rating!: number; // 1-5 stars

    @Column("text")
    comment!: string;

    @Column({ default: true })
    isVisible!: boolean; // Admin can hide inappropriate reviews

    @CreateDateColumn()
    createdAt!: Date;
}
