import { Router } from "express";
import { AdminPlayerController } from "../controllers/AdminPlayerController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/adminMiddleware";

const router = Router();

// Retrieve all players
router.get("/players", authMiddleware, adminMiddleware, AdminPlayerController.getPlayers);

// Update basic player details
router.put("/players/:id", authMiddleware, adminMiddleware, AdminPlayerController.updatePlayer);

// Delete a player
router.delete("/players/:id", authMiddleware, adminMiddleware, AdminPlayerController.deletePlayer);

// Update or add player performance statistics
router.put("/players/:id/performance", authMiddleware, adminMiddleware, AdminPlayerController.updatePlayerPerformance);

// Add match-by-match performance
router.post("/players/:id/matches", authMiddleware, adminMiddleware, AdminPlayerController.addMatchPerformance);

export default router;
