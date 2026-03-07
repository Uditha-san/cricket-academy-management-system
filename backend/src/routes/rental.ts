import { Router } from "express";
import { RentalController } from "../controllers/RentalController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/my", authMiddleware, RentalController.getMyRentals);
router.get("/availability", authMiddleware, RentalController.getAvailability);
router.get("/", authMiddleware, RentalController.getAllRentals);
router.post("/", authMiddleware, RentalController.createRental);
router.put("/:id/status", authMiddleware, RentalController.updateRentalStatus);

export default router;
