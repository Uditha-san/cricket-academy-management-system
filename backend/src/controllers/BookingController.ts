import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Booking, BookingStatus } from "../entities/Booking";
import { User, UserRole } from "../entities/User";
import { AuthRequest } from "../middleware/auth";
import { Facility } from "../entities/Facility";
import {
    sendBookingConfirmationToPlayer,
    sendBookingNotificationToAdmin,
    sendBookingNotificationToCoach,
    sendBookingApprovedToPlayer,
    sendBookingApprovedToCoach,
    BookingEmailData
} from "../services/emailService";

export class BookingController {
    static async getMyBookings(req: Request, res: Response): Promise<void> {
        const userId = (req as AuthRequest).user?.userId;

        try {
            const bookings = await AppDataSource.getRepository(Booking).find({
                where: { user: { id: userId } },
                order: { bookingDate: "DESC" },
                relations: ["facility", "user"]
            });
            res.json(bookings);
        } catch (error) {
            console.error("Get bookings error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getAllBookings(req: Request, res: Response): Promise<void> {
        try {
            const bookings = await AppDataSource.getRepository(Booking).find({
                order: { bookingDate: "DESC" },
                relations: ["facility", "user"]
            });
            res.json(bookings);
        } catch (error) {
            console.error("Get all bookings error:", error);
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
            const bookingRepository = AppDataSource.getRepository(Booking);

            const bookings = await bookingRepository.find({
                where: {
                    facility: { id: String(facilityId) },
                    bookingDate: new Date(String(date)),
                }
            });

            // Consider confirmed and pending bookings as 'booked' times
            const bookedTimes = bookings
                .filter(b => b.status !== BookingStatus.CANCELLED)
                .map(b => b.startTime);

            res.json({ bookedTimes });
        } catch (error) {
            console.error("Get availability error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async createBooking(req: Request, res: Response): Promise<void> {
        const userId = (req as AuthRequest).user?.userId;
        const { facilityId, bookingDate, startTime, duration, amount, coachId } = req.body;

        try {
            const bookingRepository = AppDataSource.getRepository(Booking);
            const userRepository = AppDataSource.getRepository(User);
            const facilityRepository = AppDataSource.getRepository(Facility);

            const user = await userRepository.findOneBy({ id: userId });
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            const facility = await facilityRepository.findOneBy({ id: facilityId });
            if (!facility) {
                res.status(404).json({ message: "Facility not found" });
                return;
            }

            let coach = null;
            if (coachId) {
                coach = await userRepository.findOneBy({ id: coachId, role: UserRole.COACH });
                if (!coach) {
                    res.status(404).json({ message: "Coach not found" });
                    return;
                }
            }

            const newBooking = bookingRepository.create({
                user,
                facility,
                bookingDate: new Date(bookingDate),
                startTime,
                duration: Number(duration),
                amount: Number(amount),
                status: BookingStatus.PENDING,
                coach: coach || undefined
            });

            await bookingRepository.save(newBooking);

            // --- Send Booking Email Notifications ---
            try {
                const emailData: BookingEmailData = {
                    bookingId: newBooking.id,
                    playerName: user.name,
                    playerEmail: user.email,
                    courtName: facility.name,
                    date: bookingDate,
                    startTime,
                    duration: Number(duration),
                    amount: Number(amount),
                    coachName: coach?.name
                };

                // 1. Email the player
                await sendBookingConfirmationToPlayer(emailData);

                // 2. Email all admins
                const admins = await AppDataSource.getRepository(User).find({
                    where: { role: UserRole.ADMIN },
                    select: ["email"]
                });
                for (const admin of admins) {
                    await sendBookingNotificationToAdmin(emailData, admin.email);
                }

                // 3. Email the assigned coach (if any)
                if (coach) {
                    await sendBookingNotificationToCoach(emailData, coach.email);
                }
            } catch (emailError) {
                // Log email errors but don't fail the booking
                console.error("Booking email notification error:", emailError);
            }
            // --- End Email Notifications ---

            res.status(201).json(newBooking);
        } catch (error) {
            console.error("Create booking error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async updateBookingStatus(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const { status } = req.body;

        try {
            const bookingRepository = AppDataSource.getRepository(Booking);
            const booking = await bookingRepository.findOne({
                where: { id: String(id) },
                relations: ["user", "facility", "coach"]
            });

            if (!booking) {
                res.status(404).json({ message: "Booking not found" });
                return;
            }

            booking.status = status as BookingStatus;
            await bookingRepository.save(booking);

            // --- Send confirmation emails when admin approves ---
            if (status === BookingStatus.CONFIRMED) {
                try {
                    const emailData: BookingEmailData = {
                        bookingId: booking.id,
                        playerName: booking.user.name,
                        playerEmail: booking.user.email,
                        courtName: booking.facility.name,
                        date: new Date(booking.bookingDate).toISOString().split('T')[0],
                        startTime: booking.startTime,
                        duration: booking.duration,
                        amount: parseFloat(booking.amount as any),
                        coachName: booking.coach?.name
                    };

                    // 1. Email the player that booking is confirmed
                    await sendBookingApprovedToPlayer(emailData);

                    // 2. Email the coach their session is confirmed (if assigned)
                    if (booking.coach) {
                        await sendBookingApprovedToCoach(emailData, booking.coach.email);
                    }
                } catch (emailError) {
                    console.error("Approval email error:", emailError);
                }
            }
            // --- End confirmation emails ---

            res.json(booking);
        } catch (error) {
            console.error("Update booking status error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
