import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { Facility } from "./Facility";

export enum RentalStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    CANCELLED = "cancelled"
}

@Entity("rentals")
export class Rental {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @ManyToOne(() => Facility, { onDelete: "CASCADE" })
    @JoinColumn({ name: "facility_id" })
    facility!: Facility;

    @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "coach_id" })
    coach!: User | null;

    @Column({ type: "date" })
    rentalDate!: Date;

    @Column()
    startTime!: string; // e.g. "09:00"

    @Column("decimal", { precision: 5, scale: 2 })
    duration!: number; // hours

    @Column("decimal", { precision: 10, scale: 2 })
    amount!: number;

    @Column({
        type: "enum",
        enum: RentalStatus,
        default: RentalStatus.PENDING
    })
    status!: RentalStatus;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
