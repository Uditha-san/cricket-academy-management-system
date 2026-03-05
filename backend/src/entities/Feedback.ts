import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "./User";

@Entity("feedbacks")
export class Feedback {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, (user) => user.feedbacksReceived, { onDelete: "CASCADE" })
    @JoinColumn({ name: "player_id" })
    player!: User;

    @ManyToOne(() => User, (user) => user.feedbacksGiven, { onDelete: "CASCADE" })
    @JoinColumn({ name: "coach_id" })
    coach!: User;

    @Column()
    area!: string;

    @Column("text")
    feedback!: string;

    @Column({ type: "int", default: 0 })
    rating!: number; // e.g., 1 to 5 stars

    @Column({ type: "boolean", default: false })
    isRead!: boolean; // To serve as notification "read/unread" status

    @CreateDateColumn()
    createdAt!: Date;
}
