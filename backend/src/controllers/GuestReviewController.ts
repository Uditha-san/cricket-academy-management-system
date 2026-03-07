import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { GuestReview } from "../entities/GuestReview";
import { User } from "../entities/User";
import { AuthRequest } from "../middleware/auth";

export class GuestReviewController {
    // POST /api/guest-reviews  — submit a review (guest only)
    static async createReview(req: Request, res: Response): Promise<void> {
        const userId = (req as AuthRequest).user?.userId;
        const { rating, comment } = req.body;

        if (!rating || !comment) {
            res.status(400).json({ message: "Rating and comment are required." });
            return;
        }
        const parsedRating = Number(rating);
        if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            res.status(400).json({ message: "Rating must be between 1 and 5." });
            return;
        }
        if (String(comment).trim().length < 10) {
            res.status(400).json({ message: "Comment must be at least 10 characters." });
            return;
        }

        try {
            const userRepo = AppDataSource.getRepository(User);
            const reviewRepo = AppDataSource.getRepository(GuestReview);

            const guest = await userRepo.findOneBy({ id: userId });
            if (!guest) {
                res.status(404).json({ message: "User not found." });
                return;
            }

            const review = reviewRepo.create({
                guest,
                rating: parsedRating,
                comment: String(comment).trim(),
                isVisible: true
            });
            await reviewRepo.save(review);

            res.status(201).json({
                id: review.id,
                rating: review.rating,
                comment: review.comment,
                guestName: guest.name,
                createdAt: review.createdAt
            });
        } catch (error) {
            console.error("Create guest review error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    // GET /api/guest-reviews  — fetch all visible reviews (public)
    static async getReviews(req: Request, res: Response): Promise<void> {
        try {
            const reviewRepo = AppDataSource.getRepository(GuestReview);
            const reviews = await reviewRepo.find({
                where: { isVisible: true },
                relations: ["guest"],
                order: { createdAt: "DESC" },
                take: 20
            });

            const result = reviews.map(r => ({
                id: r.id,
                rating: r.rating,
                comment: r.comment,
                guestName: r.guest?.name || "Guest",
                createdAt: r.createdAt
            }));

            res.json(result);
        } catch (error) {
            console.error("Get guest reviews error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    // GET /api/guest-reviews/my  — my own reviews
    static async getMyReviews(req: Request, res: Response): Promise<void> {
        const userId = (req as AuthRequest).user?.userId;
        try {
            const reviewRepo = AppDataSource.getRepository(GuestReview);
            const reviews = await reviewRepo.find({
                where: { guest: { id: userId } },
                order: { createdAt: "DESC" }
            });

            const result = reviews.map(r => ({
                id: r.id,
                rating: r.rating,
                comment: r.comment,
                createdAt: r.createdAt
            }));
            res.json(result);
        } catch (error) {
            console.error("Get my reviews error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
