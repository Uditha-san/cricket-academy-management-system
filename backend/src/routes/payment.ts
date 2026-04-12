import { Router } from "express";
import { PaymentController } from "../controllers/PaymentController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/process", authMiddleware, PaymentController.processPayment);

export default router;
