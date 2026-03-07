import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User, UserRole } from "../entities/User";
import { Feedback } from "../entities/Feedback";
import { Message } from "../entities/Message";
import { Booking } from "../entities/Booking";
import { Rental } from "../entities/Rental";

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

    // 5. Get bookings assigned to this coach
    static async getAssignedBookings(req: Request, res: Response): Promise<void> {
        // @ts-ignore
        const coachId = req.user?.userId;

        try {
            const bookingRepository = AppDataSource.getRepository(Booking);

            const bookings = await bookingRepository.find({
                where: { coach: { id: coachId } },
                relations: ["user", "facility", "coach"],
                order: { bookingDate: "ASC", startTime: "ASC" }
            });

            const result = bookings.map(b => ({
                id: b.id,
                playerName: b.user.name,
                playerId: b.user.id,
                courtName: b.facility.name,
                date: new Date(b.bookingDate).toISOString().split('T')[0],
                startTime: b.startTime,
                duration: b.duration,
                status: b.status,
                amount: parseFloat(b.amount as any)
            }));

            res.json(result);
        } catch (error) {
            console.error("Get assigned bookings error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    // 6. Get machine rentals assigned to this coach
    static async getAssignedRentals(req: Request, res: Response): Promise<void> {
        // @ts-ignore
        const coachId = req.user?.userId;

        try {
            const rentalRepository = AppDataSource.getRepository(Rental);

            const rentals = await rentalRepository.find({
                where: { coach: { id: coachId } },
                relations: ["user", "facility", "coach"],
                order: { rentalDate: "ASC", startTime: "ASC" }
            });

            const result = rentals.map(r => ({
                id: r.id,
                playerName: r.user.name,
                machineName: r.facility.name,
                date: new Date(r.rentalDate).toISOString().split('T')[0],
                startTime: r.startTime,
                duration: r.duration,
                status: r.status,
                amount: parseFloat(r.amount as any)
            }));

            res.json(result);
        } catch (error) {
            console.error("Get assigned rentals error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
