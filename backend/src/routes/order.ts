import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/adminMiddleware";

const router = Router();

// User routes (player/guest must be authenticated)
router.post("/", authMiddleware, OrderController.createOrder);
router.get("/my", authMiddleware, OrderController.myOrders);

// Admin routes
router.get("/", authMiddleware, adminMiddleware, OrderController.allOrders);
router.get("/pending-count", authMiddleware, adminMiddleware, OrderController.pendingCount);
router.patch("/:id/status", authMiddleware, adminMiddleware, OrderController.updateStatus);

export default router;
