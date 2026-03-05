import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middleware/auth"; // Assuming we have or will create this

const router = Router();

router.get("/profile", authMiddleware, UserController.getProfile);
router.put("/profile", authMiddleware, UserController.updateProfile);

router.get("/notifications", authMiddleware, UserController.getNotifications);
router.put("/notifications/:id/read", authMiddleware, UserController.markNotificationRead);

router.get("/coaches", authMiddleware, UserController.getCoaches);
router.post("/messages", authMiddleware, UserController.sendMessageToCoach);
router.get("/messages", authMiddleware, UserController.getMessagesToCoaches);

export default router;
