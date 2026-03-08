import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ShopOrder } from "./ShopOrder";

@Entity("shop_order_items")
export class ShopOrderItem {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => ShopOrder, (order) => order.items, { onDelete: "CASCADE" })
    @JoinColumn()
    order!: ShopOrder;

    @Column()
    productId!: string;

    @Column()
    productName!: string;

    @Column({ nullable: true })
    productImage!: string;

    @Column({ type: "int" })
    quantity!: number;

    @Column({ type: "decimal", precision: 12, scale: 2 })
    unitPrice!: number;
}
