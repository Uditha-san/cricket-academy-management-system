import { Router } from "express";
import { CoachController } from "../controllers/CoachController";
import { authMiddleware } from "../middleware/auth";
import { coachMiddleware } from "../middleware/coachMiddleware";

const router = Router();

// Routes for coach portal
// Middleware: authentication + role must be COACH

// Get all players
router.get("/players", authMiddleware, coachMiddleware, CoachController.getPlayers);

// Add feedback for a specific player
router.post("/players/:playerId/feedback", authMiddleware, coachMiddleware, CoachController.addFeedback);

// Get coach's own feedback history
router.get("/feedback-history", authMiddleware, coachMiddleware, CoachController.getCoachFeedbackHistory);

// Get messages received from players
router.get("/messages", authMiddleware, coachMiddleware, CoachController.getMessagesFromPlayers);

export default router;
