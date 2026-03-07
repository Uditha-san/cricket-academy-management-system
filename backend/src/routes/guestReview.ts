import { Router } from "express";
import { GuestReviewController } from "../controllers/GuestReviewController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Public — anyone can read reviews (shown on landing page & guest dashboard)
router.get("/", GuestReviewController.getReviews);

// Authenticated — guest submits a review
router.post("/", authMiddleware, GuestReviewController.createReview);

// Authenticated — guest's own reviews
router.get("/my", authMiddleware, GuestReviewController.getMyReviews);

export default router;
