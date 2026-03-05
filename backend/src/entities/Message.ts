import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "./User";

@Entity("messages")
export class Message {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, (user) => user.messagesSent, { onDelete: "CASCADE" })
    @JoinColumn({ name: "sender_id" })
    sender!: User;

    @ManyToOne(() => User, (user) => user.messagesReceived, { onDelete: "CASCADE" })
    @JoinColumn({ name: "receiver_id" })
    receiver!: User;

    @Column("text")
    content!: string;

    @Column({ type: "boolean", default: false })
    isRead!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}
