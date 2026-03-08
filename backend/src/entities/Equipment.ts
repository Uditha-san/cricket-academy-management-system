import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("equipment")
export class Equipment {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column()
    category!: string;

    @Column({ type: "decimal", precision: 12, scale: 2 })
    price!: number;

    @Column({ type: "int", default: 0 })
    stock!: number;

    @Column({ type: "text", nullable: true })
    image!: string;

    @Column({ type: "text", nullable: true })
    description!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
