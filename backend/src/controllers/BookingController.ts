import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Booking } from "../entities/Booking";
import { AuthRequest } from "../middleware/auth";

export class BookingController {
    static async getMyBookings(req: Request, res: Response): Promise<void> {
        const userId = (req as AuthRequest).user?.userId;

        try {
            const bookings = await AppDataSource.getRepository(Booking).find({
                where: { user: { id: userId } },
                order: { bookingDate: "DESC" },
                relations: ["facility"]
            });
            res.json(bookings);
        } catch (error) {
            console.error("Get bookings error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
