import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { ShopOrder, OrderStatus } from "../entities/ShopOrder";
import { ShopOrderItem } from "../entities/ShopOrderItem";
import { Equipment } from "../entities/Equipment";

const orderRepo = () => AppDataSource.getRepository(ShopOrder);
const orderItemRepo = () => AppDataSource.getRepository(ShopOrderItem);
const equipmentRepo = () => AppDataSource.getRepository(Equipment);

export class OrderController {

    /** POST /api/orders — place a new order (authenticated: player or guest) */
    static async createOrder(req: Request, res: Response) {
        try {
            const { deliveryName, deliveryPhone, deliveryAddress, items } = req.body;
            const userId = (req as any).user?.userId;

            if (!deliveryName || !deliveryPhone || !deliveryAddress || !items?.length) {
                return res.status(400).json({ message: "Missing required fields." });
            }

            // Verify stock and calculate total
            let total = 0;
            for (const item of items) {
                const product = await equipmentRepo().findOneBy({ id: item.productId });
                if (!product) {
                    return res.status(404).json({ message: `Product ${item.productName} not found.` });
                }
                if (product.stock < item.quantity) {
                    return res.status(400).json({ message: `Insufficient stock for ${item.productName}. Available: ${product.stock}` });
                }
                total += Number(item.unitPrice) * item.quantity;
            }

            const order = orderRepo().create({
                userId,
                deliveryName,
                deliveryPhone,
                deliveryAddress,
                totalAmount: total,
                status: OrderStatus.PENDING,
            });

            const savedOrder = await orderRepo().save(order);

            // Save items and update stock
            const orderItems = [];
            for (const i of items) {
                const orderItem = orderItemRepo().create({
                    order: savedOrder,
                    productId: i.productId,
                    productName: i.productName,
                    productImage: i.productImage || "",
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                });
                orderItems.push(orderItem);

                // Update stock
                await equipmentRepo().decrement({ id: i.productId }, "stock", i.quantity);
            }
            await orderItemRepo().save(orderItems);

            // Return the order with items
            const fullOrder = await orderRepo().findOne({
                where: { id: savedOrder.id },
                relations: ["items"],
            });

            return res.status(201).json(fullOrder);
        } catch (err) {
            console.error("createOrder error:", err);
            return res.status(500).json({ message: "Failed to create order." });
        }
    }

    /** GET /api/orders/my — orders of the logged-in user */
    static async myOrders(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            const orders = await orderRepo().find({
                where: { userId },
                relations: ["items"],
                order: { createdAt: "DESC" },
            });
            return res.json(orders);
        } catch (err) {
            console.error("myOrders error:", err);
            return res.status(500).json({ message: "Failed to fetch orders." });
        }
    }

    /** GET /api/orders — admin: all orders */
    static async allOrders(req: Request, res: Response) {
        try {
            const orders = await orderRepo().find({
                relations: ["items", "user"],
                order: { createdAt: "DESC" },
            });
            return res.json(orders);
        } catch (err) {
            console.error("allOrders error:", err);
            return res.status(500).json({ message: "Failed to fetch orders." });
        }
    }

    /** GET /api/orders/pending-count — admin: count of pending orders (for notification badge) */
    static async pendingCount(req: Request, res: Response) {
        try {
            const count = await orderRepo().count({ where: { status: OrderStatus.PENDING } });
            return res.json({ count });
        } catch (err) {
            return res.status(500).json({ message: "Failed to count orders." });
        }
    }

    /** PATCH /api/orders/:id/status — admin: update order status */
    static async updateStatus(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const { status } = req.body;

            if (!Object.values(OrderStatus).includes(status)) {
                return res.status(400).json({ message: "Invalid status." });
            }

            const order = await orderRepo().findOne({ where: { id }, relations: ["items"] });
            if (!order) return res.status(404).json({ message: "Order not found." });

            order.status = status;
            await orderRepo().save(order);
            return res.json(order);
        } catch (err) {
            console.error("updateStatus error:", err);
            return res.status(500).json({ message: "Failed to update order." });
        }
    }
}
