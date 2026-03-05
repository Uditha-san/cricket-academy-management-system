import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, BeforeInsert, BeforeUpdate } from "typeorm";
import { Booking } from "./Booking";
import { PlayerPerformance } from "./PlayerPerformance";
import { PlayerProfile } from "./PlayerProfile";
import { CoachProfile } from "./CoachProfile";
import { AdminProfile } from "./AdminProfile";
import { MatchPerformance } from "./MatchPerformance";
import { Feedback } from "./Feedback";
import { Message } from "./Message";
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

    // End of common fields

    @CreateDateColumn()
    joinDate!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => Booking, (booking) => booking.user)
    bookings!: Booking[];

    @OneToOne(() => PlayerPerformance, (performance) => performance.user)
    performance!: any;

    @OneToOne(() => PlayerProfile, (profile) => profile.user, { cascade: true })
    playerProfile!: PlayerProfile;

    @OneToOne(() => CoachProfile, (profile) => profile.user, { cascade: true })
    coachProfile!: CoachProfile;

    @OneToOne(() => AdminProfile, (profile) => profile.user, { cascade: true })
    adminProfile!: AdminProfile;

    @OneToMany(() => MatchPerformance, (match) => match.user)
    matchPerformances!: MatchPerformance[];

    @OneToMany(() => Feedback, (feedback) => feedback.player)
    feedbacksReceived!: Feedback[];

    @OneToMany(() => Feedback, (feedback) => feedback.coach)
    feedbacksGiven!: Feedback[];

    @OneToMany(() => Message, (message) => message.sender)
    messagesSent!: Message[];

    @OneToMany(() => Message, (message) => message.receiver)
    messagesReceived!: Message[];
}
