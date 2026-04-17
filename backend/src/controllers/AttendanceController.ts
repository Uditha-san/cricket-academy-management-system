import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User, UserRole } from "../entities/User";
import { Attendance, AttendanceStatus } from "../entities/Attendance";

export class AttendanceController {
    // 1. Mark attendance (for Coach)
    static async markAttendance(req: Request, res: Response): Promise<void> {
        // @ts-ignore - req.user is set by authMiddleware
        const coachId = req.user?.userId;
        const { date, records } = req.body; // records: [{ playerId, status }]

        if (!date || !records || !Array.isArray(records)) {
            res.status(400).json({ message: "Date and records array are required." });
            return;
        }

        try {
            const userRepository = AppDataSource.getRepository(User);
            const attendanceRepository = AppDataSource.getRepository(Attendance);

            const coach = await userRepository.findOneBy({ id: coachId });
            if (!coach) {
                res.status(404).json({ message: "Coach not found" });
                return;
            }

            for (const record of records) {
                const { playerId, status } = record;
                const player = await userRepository.findOneBy({ id: playerId, role: UserRole.PLAYER });
                
                if (player) {
                    // Check if attendance already marked for this date
                    let attendance = await attendanceRepository.findOneBy({ 
                        player: { id: playerId },
                        date: date 
                    });

                    if (!attendance) {
                        attendance = new Attendance();
                        attendance.player = player;
                        attendance.coach = coach;
                        attendance.date = date;
                    }
                    
                    // Always set status (either update or insert)
                    attendance.status = status as AttendanceStatus;
                    await attendanceRepository.save(attendance);
                }
            }

            res.status(200).json({ message: "Attendance marked successfully" });
        } catch (error) {
            console.error("Mark attendance error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    // 2. Get attendance for a specific date (for Coach to view/edit)
    static async getAttendanceByDate(req: Request, res: Response): Promise<void> {
        const { date } = req.query;

        if (!date) {
            res.status(400).json({ message: "Date is required." });
            return;
        }

        try {
            const attendanceRepository = AppDataSource.getRepository(Attendance);
            // We retrieve attendance records for a given date
            const records = await attendanceRepository.find({
                where: { date: String(date) },
                relations: ["player"]
            });

            // Map it for easier frontend use
            const result = records.map(r => ({
                id: r.id,
                playerId: r.player.id,
                playerName: r.player.name,
                date: r.date,
                status: r.status
            }));

            res.json(result);
        } catch (error) {
            console.error("Get attendance error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    // 3. Get my attendance (for Player)
    static async getMyAttendance(req: Request, res: Response): Promise<void> {
        // @ts-ignore
        const playerId = req.user?.userId;

        try {
            const attendanceRepository = AppDataSource.getRepository(Attendance);
            const records = await attendanceRepository.find({
                where: { player: { id: playerId } },
                order: { date: "DESC" }
            });

            const result = records.map(r => ({
                id: r.id,
                date: r.date,
                status: r.status
            }));

            res.json(result);
        } catch (error) {
            console.error("Get my attendance error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
