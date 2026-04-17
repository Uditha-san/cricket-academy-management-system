import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "./User";

export enum AttendanceStatus {
    PRESENT = "Present",
    ABSENT = "Absent"
}

@Entity("attendance")
export class Attendance {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "playerId" })
    player!: User;

    @ManyToOne(() => User, (user) => user.id, { onDelete: "SET NULL", nullable: true })
    @JoinColumn({ name: "coachId" })
    coach!: User;

    @Column({ type: "date" })
    date!: string;

    @Column({
        type: "enum",
        enum: AttendanceStatus,
        default: AttendanceStatus.PRESENT
    })
    status!: AttendanceStatus;

    @CreateDateColumn()
    createdAt!: Date;
}
