import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Facility } from "./Facility";
import { IsDate, IsEnum, IsNotEmpty, IsNumber, Min } from "class-validator";

export enum BookingStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    CANCELLED = "cancelled",
    COMPLETED = "completed"
}

@Entity("bookings")
export class Booking {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Facility, { eager: true }) // Load facility details automatically with booking
    @JoinColumn({ name: "facility_id" })
    facility!: Facility;

    @Column()
    @IsNotEmpty()
    bookingDate!: Date;

    @Column()
    @IsNotEmpty()
    startTime!: string; // Format: "14:00"

    @Column()
    @IsNumber()
    @Min(0.5)
    duration!: number; // in hours

    @Column({ type: "decimal", precision: 10, scale: 2 })
    @IsNumber()
    amount!: number;

    @Column({
        type: "enum",
        enum: BookingStatus,
        default: BookingStatus.PENDING
    })
    @IsEnum(BookingStatus)
    status!: BookingStatus;

    @ManyToOne(() => User, { nullable: true, eager: true })
    @JoinColumn({ name: "coach_id" })
    coach?: User;

    // Relations
    @ManyToOne(() => User, (user) => user.bookings)
    @JoinColumn({ name: "user_id" })
    user!: User;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
