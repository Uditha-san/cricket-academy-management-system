import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./User";

export enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    SHIPPED = "shipped",
    CANCELLED = "cancelled"
}

@Entity("shop_orders")
export class ShopOrder {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn()
    user!: User | null;

    @Column({ nullable: true })
    userId!: string;

    // Delivery info stored directly (no need for separate table)
    @Column()
    deliveryName!: string;

    @Column()
    deliveryPhone!: string;

    @Column("text")
    deliveryAddress!: string;

    @Column({ type: "decimal", precision: 12, scale: 2 })
    totalAmount!: number;

    @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.PENDING })
    status!: OrderStatus;

    @OneToMany("ShopOrderItem", "order", { cascade: true, eager: true })
    items!: any[];

    @CreateDateColumn()
    createdAt!: Date;
}
