import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User, UserRole } from "../entities/User";
import { Feedback } from "../entities/Feedback";
import { Message } from "../entities/Message";

export class CoachController {
    // 1. Get all players for coach to select and view
    static async getPlayers(req: Request, res: Response): Promise<void> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const players = await userRepository.find({
                where: { role: UserRole.PLAYER },
                select: ["id", "name", "email", "phone", "avatar"]
            });
            res.json(players);
        } catch (error) {
            console.error("Get players error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    // 2. Add feedback to a specific player
    static async addFeedback(req: Request, res: Response): Promise<void> {
        // @ts-ignore - req.user is set by authMiddleware
        const coachId = req.user?.userId;
        const { playerId } = req.params;
        const { area, feedback, rating } = req.body;

        if (!area || !feedback || rating === undefined) {
            res.status(400).json({ message: "Area, feedback, and rating are required." });
            return;
        }

        try {
            const userRepository = AppDataSource.getRepository(User);
            const feedbackRepository = AppDataSource.getRepository(Feedback);

            const coach = await userRepository.findOneBy({ id: coachId });
            const player = await userRepository.findOneBy({ id: String(playerId), role: UserRole.PLAYER });

            if (!coach || !player) {
                res.status(404).json({ message: "Coach or Player not found" });
                return;
            }

            const newFeedback = new Feedback();
            newFeedback.coach = coach;
            newFeedback.player = player;
            newFeedback.area = area;
            newFeedback.feedback = String(feedback);
            newFeedback.rating = Number(rating);

            await feedbackRepository.save(newFeedback);

            res.status(201).json({ message: "Feedback added successfully", feedback: newFeedback });
        } catch (error) {
            console.error("Add feedback error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    // 3. Get feedback history provided by this coach
    static async getCoachFeedbackHistory(req: Request, res: Response): Promise<void> {
        // @ts-ignore
        const coachId = req.user?.userId;

        try {
            const feedbackRepository = AppDataSource.getRepository(Feedback);

            const feedbacks = await feedbackRepository.find({
                where: { coach: { id: coachId } },
                relations: ["player"],
                order: { createdAt: "DESC" }
            });

            // Map it to only send public/necessary info about the player
            const result = feedbacks.map(f => ({
                id: f.id,
                area: f.area,
                feedback: f.feedback,
                rating: f.rating,
                isRead: f.isRead,
                createdAt: f.createdAt,
                player: {
                    id: f.player.id,
                    name: f.player.name
                }
            }));

            res.json(result);
        } catch (error) {
            console.error("Get coach feedback error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    // 4. Get messages from players to this coach
    static async getMessagesFromPlayers(req: Request, res: Response): Promise<void> {
        // @ts-ignore
        const coachId = req.user?.userId;

        try {
            const messageRepository = AppDataSource.getRepository(Message);
            const messages = await messageRepository.find({
                where: { receiver: { id: coachId } },
                relations: ["sender"],
                order: { createdAt: "DESC" }
            });

            const result = messages.map(m => ({
                id: m.id,
                playerName: m.sender.name,
                playerId: m.sender.id,
                content: m.content,
                isRead: m.isRead,
                createdAt: m.createdAt
            }));

            // Mark as read optionally
            /*
            const unreadMessages = messages.filter(m => !m.isRead);
            if (unreadMessages.length > 0) {
                unreadMessages.forEach(m => m.isRead = true);
                await messageRepository.save(unreadMessages);
            }
            */

            res.json(result);
        } catch (error) {
            console.error("Get messages error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
