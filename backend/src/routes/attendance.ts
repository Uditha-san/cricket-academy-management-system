import { Router } from "express";
import { AttendanceController } from "../controllers/AttendanceController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Coach routes
router.post("/mark", authMiddleware, AttendanceController.markAttendance);
router.get("/by-date", authMiddleware, AttendanceController.getAttendanceByDate);

// Player routes
router.get("/my", authMiddleware, AttendanceController.getMyAttendance);

export default router;
