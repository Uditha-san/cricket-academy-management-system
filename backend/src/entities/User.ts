import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BeforeInsert, BeforeUpdate } from "typeorm";
import { Booking } from "./Booking";
import { IsEmail, IsNotEmpty, IsEnum, IsOptional, Length } from "class-validator";

export enum UserRole {
    ADMIN = "admin",
    COACH = "coach",
    PLAYER = "player",
    GUEST = "guest"
}

export enum UserStatus {
    ACTIVE = "Active",
    INACTIVE = "Inactive"
}

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    @IsNotEmpty()
    name!: string;

    @Column({ unique: true })
    @IsEmail()
    email!: string;

    @Column({ select: false }) // Do not return password by default
    @IsNotEmpty()
    @Length(6, 100, { message: "Password must be at least 6 characters long" })
    password!: string;

    @Column()
    @IsNotEmpty()
    phone!: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.GUEST
    })
    @IsEnum(UserRole)
    role!: UserRole;

    @Column({
        type: "enum",
        enum: UserStatus,
        default: UserStatus.ACTIVE
    })
    @IsEnum(UserStatus)
    status!: UserStatus;

    @Column({ default: false })
    isVerified!: boolean;

    @Column({ nullable: true, select: false })
    verificationToken!: string;

    @Column({ nullable: true, select: false })
    resetPasswordToken!: string;

    @Column({ nullable: true, select: false })
    resetPasswordExpires!: Date;

    @Column({ nullable: true })
    @IsOptional()
    avatar!: string;

    // Player specific fields
    @Column({ nullable: true })
    @IsOptional()
    battingStyle!: string;

    @Column({ nullable: true })
    @IsOptional()
    bowlingStyle!: string;

    @Column({ default: 0 })
    totalBookings!: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    totalSpent!: number;

    @Column({ nullable: true })
    @IsOptional()
    preferredPosition!: string;

    @Column({ nullable: true })
    @IsOptional()
    address!: string;

    @Column({ nullable: true })
    @IsOptional()
    emergencyContact!: string;

    @CreateDateColumn()
    joinDate!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => Booking, (booking) => booking.user)
    bookings!: Booking[];
}
