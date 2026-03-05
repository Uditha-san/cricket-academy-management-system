import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User, UserRole } from "../entities/User";
import { PlayerPerformance } from "../entities/PlayerPerformance";
import { MatchPerformance } from "../entities/MatchPerformance";

export class AdminPlayerController {
    static async getPlayers(req: Request, res: Response): Promise<void> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            // Fetch users with role PLAYER and include their performance stats
            const players = await userRepository.find({
                where: { role: UserRole.PLAYER },
                relations: ["performance", "playerProfile"],
                // Exclude sensitive Info like tokens
                select: ["id", "name", "email", "phone", "role", "status", "joinDate"]
            });
            res.json(players);
        } catch (error) {
            console.error("Get players error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async updatePlayer(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const { name, email, phone, status, battingStyle, bowlingStyle, preferredPosition, dateOfBirth } = req.body;

        try {
            const userRepository = AppDataSource.getRepository(User);
            const player = await userRepository.findOne({
                where: { id: String(id) },
                relations: ["playerProfile"]
            });

            if (!player) {
                res.status(404).json({ message: "Player not found" });
                return;
            }

            // Update allowed fields
            if (name) player.name = name;
            if (email) player.email = email;
            if (phone) player.phone = phone;
            if (status) player.status = status;

            if (player.playerProfile) {
                if (dateOfBirth) player.playerProfile.dateOfBirth = dateOfBirth;
                if (battingStyle) player.playerProfile.battingStyle = battingStyle;
                if (bowlingStyle) player.playerProfile.bowlingStyle = bowlingStyle;
                if (preferredPosition) player.playerProfile.preferredPosition = preferredPosition;
            }

            await userRepository.save(player);
            res.json({ message: "Player updated successfully", player });
        } catch (error) {
            console.error("Update player error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async deletePlayer(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const userRepository = AppDataSource.getRepository(User);
            const player = await userRepository.findOneBy({ id: String(id) });

            if (!player) {
                res.status(404).json({ message: "Player not found" });
                return;
            }

            // Remove the player. It will cascade to player_performance if set up correctly.
            await userRepository.remove(player);
            res.json({ message: "Player deleted successfully" });
        } catch (error) {
            console.error("Delete player error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async updatePlayerPerformance(req: Request, res: Response): Promise<void> {
        const { id } = req.params; // Player user ID
        const stats = req.body; // e.g., matchesPlayed, totalRuns, totalWickets, etc.

        try {
            const userRepository = AppDataSource.getRepository(User);
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

            // Recalculate
            await AdminPlayerController.recalculatePlayerPerformance(player.id);

            res.status(201).json({ message: "Match performance added successfully", match });
        } catch (error) {
            console.error("Add match performance error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async recalculatePlayerPerformance(userId: string): Promise<void> {
        const matchPerfRepo = AppDataSource.getRepository(MatchPerformance);
        const matches = await matchPerfRepo.find({ where: { user: { id: userId } } });

        const stats = {
            matchesPlayed: matches.length,
            totalRuns: 0,
            highestScore: 0,
            hundreds: 0,
            fifties: 0,
            totalWickets: 0,
            fiveWicketHauls: 0,
            catches: 0,
            stumpings: 0,
            battingAverage: 0,
            strikeRate: 0,
            bowlingAverage: 0,
            economyRate: 0
        };

        let totalBallsFaced = 0;
        let timesDismissed = 0;
        let totalRunsConceded = 0;
        let totalBallsBowled = 0;

        for (const m of matches) {
            stats.totalRuns += m.runsScored;
            if (m.runsScored > stats.highestScore) stats.highestScore = m.runsScored;
            if (m.runsScored >= 100) stats.hundreds++;
            else if (m.runsScored >= 50) stats.fifties++;

            totalBallsFaced += m.ballsFaced;
            if (m.isDismissed) timesDismissed++;

            stats.totalWickets += m.wicketsTaken;
            if (m.wicketsTaken >= 5) stats.fiveWicketHauls++;

            totalRunsConceded += m.runsConceded;
            totalBallsBowled += m.ballsBowled;

            stats.catches += m.catches;
            stats.stumpings += m.stumpings;
        }

        stats.battingAverage = timesDismissed > 0 ? Number((stats.totalRuns / timesDismissed).toFixed(2)) : stats.totalRuns;
        stats.strikeRate = totalBallsFaced > 0 ? Number(((stats.totalRuns / totalBallsFaced) * 100).toFixed(2)) : 0;
        stats.bowlingAverage = stats.totalWickets > 0 ? Number((totalRunsConceded / stats.totalWickets).toFixed(2)) : 0;

        const totalOvers = totalBallsBowled / 6;
        stats.economyRate = totalOvers > 0 ? Number((totalRunsConceded / totalOvers).toFixed(2)) : 0;

        const performanceRepository = AppDataSource.getRepository(PlayerPerformance);
        let performance = await performanceRepository.findOne({ where: { user: { id: userId } } });

        if (!performance) {
            performance = new PlayerPerformance();
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOneBy({ id: userId });
            if (user) performance.user = user;
            else return;
        }

        performanceRepository.merge(performance, stats);
        await performanceRepository.save(performance);
    }
}
