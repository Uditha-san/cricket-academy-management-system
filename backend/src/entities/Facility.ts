import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { IsNotEmpty, IsNumber, IsString, IsEnum, IsBoolean, Min } from "class-validator";

export enum FacilityType {
    NET = "net",
    BOWLING_MACHINE = "bowling_machine",
    PITCH = "pitch",
    GYM = "gym",
    OTHER = "other"
}

@Entity("facilities")
export class Facility {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    @IsNotEmpty()
    @IsString()
    name!: string;

    @Column({
        type: "enum",
        enum: FacilityType,
        default: FacilityType.NET
    })
    @IsEnum(FacilityType)
    type!: FacilityType;

    @Column("decimal", { precision: 10, scale: 2 })
    @IsNumber()
    @Min(0)
    pricePerHour!: number;

    @Column({ type: "text", nullable: true })
    @IsString()
    description!: string;

    @Column({ nullable: true })
    @IsString()
    imageUrl!: string;

    @Column({ default: true })
    @IsBoolean()
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
