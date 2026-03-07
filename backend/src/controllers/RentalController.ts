import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Rental, RentalStatus } from "../entities/Rental";
import { User, UserRole } from "../entities/User";
import { Facility } from "../entities/Facility";
import { AuthRequest } from "../middleware/auth";
import {
    sendBookingApprovedToPlayer,
    BookingEmailData
} from "../services/emailService";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const sendRentalNotificationToAdmin = async (data: any, adminEmail: string) => {
    await transporter.sendMail({
        from: `"SCC Academy" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `🏏 New Machine Rental: ${data.playerName} - ${data.machineName}`,
        html: `<p>New rental request from <strong>${data.playerName}</strong> for <strong>${data.machineName}</strong> on ${data.date} at ${data.startTime} for ${data.duration}h. Total: Rs.${data.amount}. Please log in to approve.</p>`
    });
};

const sendRentalConfirmedToPlayer = async (data: any) => {
    await transporter.sendMail({
        from: `"SCC Academy" <${process.env.EMAIL_USER}>`,
        to: data.playerEmail,
        subject: "✅ Machine Rental Confirmed - SCC Academy",
        html: `<p>Dear <strong>${data.playerName}</strong>, your rental of <strong>${data.machineName}</strong> on ${data.date} at ${data.startTime} for ${data.duration}h has been <strong style="color:#16a34a;">Confirmed</strong>. Total: Rs.${data.amount}. See you there!</p>`
    });
};

export class RentalController {
    static async getMyRentals(req: Request, res: Response): Promise<void> {
        const userId = (req as AuthRequest).user?.userId;
        try {
            const rentals = await AppDataSource.getRepository(Rental).find({
                where: { user: { id: userId } },
                relations: ["facility", "user"],
                order: { rentalDate: "DESC" }
            });
            res.json(rentals);
        } catch (error) {
            console.error("Get rentals error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getAllRentals(req: Request, res: Response): Promise<void> {
        try {
            const rentals = await AppDataSource.getRepository(Rental).find({
                relations: ["facility", "user"],
                order: { rentalDate: "DESC" }
            });
            res.json(rentals);
        } catch (error) {
            console.error("Get all rentals error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getAvailability(req: Request, res: Response): Promise<void> {
        const { date, facilityId } = req.query;
        if (!date || !facilityId) {
            res.status(400).json({ message: "Date and facilityId are required" });
            return;
        }
        try {
            const rentals = await AppDataSource.getRepository(Rental).find({
                where: {
                    facility: { id: String(facilityId) },
                    rentalDate: new Date(String(date))
                }
            });

            const bookedTimes = rentals
                .filter(r => r.status !== RentalStatus.CANCELLED)
                .map(r => r.startTime);

            res.json({ bookedTimes });
        } catch (error) {
            console.error("Get rental availability error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async createRental(req: Request, res: Response): Promise<void> {
        const userId = (req as AuthRequest).user?.userId;
        const { facilityId, rentalDate, startTime, duration, amount, coachId } = req.body;

        try {
            const userRepo = AppDataSource.getRepository(User);
            const facilityRepo = AppDataSource.getRepository(Facility);
            const rentalRepo = AppDataSource.getRepository(Rental);

            const user = await userRepo.findOneBy({ id: userId });
            if (!user) { res.status(404).json({ message: "User not found" }); return; }

            const facility = await facilityRepo.findOneBy({ id: facilityId });
            if (!facility) { res.status(404).json({ message: "Machine not found" }); return; }

            let coach = null;
            if (coachId) {
                coach = await userRepo.findOneBy({ id: coachId });
            }

            const rental = rentalRepo.create({
                user,
                facility,
                coach,
                rentalDate: new Date(rentalDate),
                startTime,
                duration: Number(duration),
                amount: Number(amount),
                status: RentalStatus.PENDING
            });

            await rentalRepo.save(rental);

            // Email notifications
            try {
                const emailData = {
                    playerName: user.name,
                    playerEmail: user.email,
                    machineName: facility.name,
                    date: rentalDate,
                    startTime,
                    duration: Number(duration),
                    amount: Number(amount)
                };

                // Email admins
                const admins = await userRepo.find({ where: { role: UserRole.ADMIN }, select: ["email"] });
                for (const admin of admins) {
                    await sendRentalNotificationToAdmin(emailData, admin.email);
                }
            } catch (emailErr) {
                console.error("Rental email error:", emailErr);
            }

            res.status(201).json(rental);
        } catch (error) {
            console.error("Create rental error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async updateRentalStatus(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const { status } = req.body;

        try {
            const rentalRepo = AppDataSource.getRepository(Rental);
            const rental = await rentalRepo.findOne({
                where: { id: String(id) },
                relations: ["user", "facility"]
            });

            if (!rental) { res.status(404).json({ message: "Rental not found" }); return; }

            rental.status = status as RentalStatus;
            await rentalRepo.save(rental);

            // Send confirmed email to player
            if (status === RentalStatus.CONFIRMED) {
                try {
                    await sendRentalConfirmedToPlayer({
                        playerName: rental.user.name,
                        playerEmail: rental.user.email,
                        machineName: rental.facility.name,
                        date: new Date(rental.rentalDate).toISOString().split("T")[0],
                        startTime: rental.startTime,
                        duration: rental.duration,
                        amount: parseFloat(rental.amount as any)
                    });
                } catch (emailErr) {
                    console.error("Rental confirm email error:", emailErr);
                }
            }

            res.json(rental);
        } catch (error) {
            console.error("Update rental status error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
