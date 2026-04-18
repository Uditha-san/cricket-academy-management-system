import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User, UserRole } from "../entities/User";
import { Feedback } from "../entities/Feedback";
import { Message } from "../entities/Message";
import { Booking } from "../entities/Booking";
import { Rental } from "../entities/Rental";
import { AdminPlayerController } from "./AdminPlayerController";
import { MatchPerformance } from "../entities/MatchPerformance";

export class CoachController {
    // 1. Get all players for coach to select and view
    static async getPlayers(req: Request, res: Response): Promise<void> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const players = await userRepository.find({
                where: { role: UserRole.PLAYER },
                relations: ["performance"]
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

            // Fetch coach and player IN PARALLEL
            const [coach, player] = await Promise.all([
                userRepository.findOneBy({ id: coachId }),
                userRepository.findOneBy({ id: String(playerId), role: UserRole.PLAYER })
            ]);

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
    // 7. Update Player Performance (for Statistics update modal)
    static async updatePlayerPerformance(req: Request, res: Response): Promise<void> {
        const { id } = req.params; // Player user ID
        const stats = req.body;

        try {
            const userRepository = AppDataSource.getRepository(User);
            // Dynamic import of PlayerPerformance to avoid circular deps or messy top imports if not existed
            const { PlayerPerformance } = require("../entities/PlayerPerformance");
            const performanceRepository = AppDataSource.getRepository(PlayerPerformance);

            const player = await userRepository.findOneBy({ id: String(id), role: UserRole.PLAYER });
            if (!player) {
                res.status(404).json({ message: "Player not found" });
                return;
            }

            let performance = await performanceRepository.findOne({ where: { user: { id: player.id } } });

            if (!performance) {
                const newPerformance = new PlayerPerformance();
                newPerformance.user = player;
                performanceRepository.merge(newPerformance, stats);
                await performanceRepository.save(newPerformance);

                res.json({ message: "Player performance updated successfully", performance: newPerformance });
                return;
            }

            // Update existing performance record
            performanceRepository.merge(performance, stats);
            await performanceRepository.save(performance);

            res.json({ message: "Player performance updated successfully", performance });
        } catch (error) {
            console.error("Update player performance error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    // 8. Add Match Performance (calculates everything automatically)
    static async addMatchPerformance(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const { matchDate, opponent, runsScored, ballsFaced, fours, sixes, isDismissed, ballsBowled, maidens, runsConceded, wicketsTaken, catches, stumpings } = req.body;

        try {
            const userRepository = AppDataSource.getRepository(User);
            const player = await userRepository.findOneBy({ id: String(id), role: UserRole.PLAYER });

            if (!player) {
                res.status(404).json({ message: "Player not found" });
                return;
            }

            const matchPerfRepo = AppDataSource.getRepository(MatchPerformance);
            const match = new MatchPerformance();
            match.user = player;
            match.matchDate = matchDate;
            match.opponent = opponent;
            match.runsScored = Number(runsScored) || 0;
            match.ballsFaced = Number(ballsFaced) || 0;
            match.fours = Number(fours) || 0;
            match.sixes = Number(sixes) || 0;
            match.isDismissed = isDismissed !== undefined ? Boolean(isDismissed) : true;
            match.ballsBowled = Number(ballsBowled) || 0;
            match.maidens = Number(maidens) || 0;
            match.runsConceded = Number(runsConceded) || 0;
            match.wicketsTaken = Number(wicketsTaken) || 0;
            match.catches = Number(catches) || 0;
            match.stumpings = Number(stumpings) || 0;

            await matchPerfRepo.save(match);

            // Recalculate using the existing logic in AdminPlayerController
            await AdminPlayerController.recalculatePlayerPerformance(player.id);

            res.status(201).json({ message: "Match performance added successfully", match });
        } catch (error) {
            console.error("Add match performance error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
