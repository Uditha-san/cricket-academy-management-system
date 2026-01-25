import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from "typeorm";
import { Booking } from "./Booking";
import { IsNotEmpty, IsEnum, IsNumber, IsString } from "class-validator";

export enum PaymentMethod {
    CASH = "cash",
    CARD = "card",
    ONLINE = "online"
}

export enum PaymentStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded"
}

@Entity("payments")
export class Payment {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column("decimal", { precision: 10, scale: 2 })
    @IsNumber()
    amount!: number;

    @Column({
        type: "enum",
        enum: PaymentMethod
    })
    @IsEnum(PaymentMethod)
    method!: PaymentMethod;

    @Column({
        type: "enum",
        enum: PaymentStatus,
        default: PaymentStatus.PENDING
    })
    @IsEnum(PaymentStatus)
    status!: PaymentStatus;

    @Column({ nullable: true })
    @IsString()
    transactionId!: string;

    @OneToOne(() => Booking)
    @JoinColumn()
    booking!: Booking;

    @CreateDateColumn()
    paymentDate!: Date;
}
