import { Router } from "express";
import { BookingController } from "../controllers/BookingController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/my", authMiddleware, BookingController.getMyBookings);
router.get("/availability", authMiddleware, BookingController.getAvailability);
router.get("/", authMiddleware, BookingController.getAllBookings);
router.post("/", authMiddleware, BookingController.createBooking);
router.put("/:id/status", authMiddleware, BookingController.updateBookingStatus);

export default router;
