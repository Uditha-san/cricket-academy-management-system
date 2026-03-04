import { Router } from "express";
import { BookingController } from "../controllers/BookingController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/my", authMiddleware, BookingController.getMyBookings);

export default router;
