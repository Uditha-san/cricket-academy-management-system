import { Router } from "express";
import { EquipmentController } from "../controllers/EquipmentController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/adminMiddleware";

const router = Router();

// Public/Auth routes
router.get("/", EquipmentController.getAll);
router.get("/:id", EquipmentController.getOne);

// Admin routes
router.post("/", authMiddleware, adminMiddleware, EquipmentController.create);
router.put("/:id", authMiddleware, adminMiddleware, EquipmentController.update);
router.delete("/:id", authMiddleware, adminMiddleware, EquipmentController.delete);

export default router;
