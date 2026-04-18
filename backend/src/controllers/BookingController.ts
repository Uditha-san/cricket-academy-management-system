import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Booking, BookingStatus } from "../entities/Booking";
import { User, UserRole } from "../entities/User";
import { AuthRequest } from "../middleware/auth";
import { Facility } from "../entities/Facility";
import { Payment, PaymentStatus } from "../entities/Payment";
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
            const bookings = await AppDataSource.getRepository(Booking).find({
                where: {
                    facility: { id: String(facilityId) },
                    bookingDate: new Date(String(date)),
                },
                select: ["id", "startTime", "status"]
            });

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
            // Validate bookingDate early before hitting DB
            const parsedDate = new Date(bookingDate);
            if (!bookingDate || isNaN(parsedDate.getTime())) {
                res.status(400).json({ message: "Invalid booking date. Please select a valid date (YYYY-MM-DD)." });
                return;
            }

            const userRepository = AppDataSource.getRepository(User);
            const facilityRepository = AppDataSource.getRepository(Facility);

            // Fetch user, facility, and coach IN PARALLEL instead of sequentially
            const [user, facility, coach] = await Promise.all([
                userRepository.findOneBy({ id: userId }),
                facilityRepository.findOneBy({ id: facilityId }),
                coachId ? userRepository.findOneBy({ id: coachId, role: UserRole.COACH }) : Promise.resolve(null)
            ]);

            if (!user) { res.status(404).json({ message: "User not found" }); return; }
            if (!facility) { res.status(404).json({ message: "Facility not found" }); return; }
            if (coachId && !coach) { res.status(404).json({ message: "Coach not found" }); return; }

            const newBooking = AppDataSource.getRepository(Booking).create({
                user,
                facility,
                bookingDate: parsedDate,
                startTime,
                duration: Number(duration),
                amount: Number(amount),
                status: BookingStatus.PENDING,
                coach: coach || undefined
            });

            await AppDataSource.getRepository(Booking).save(newBooking);

            // Send response immediately, then fire emails in background
            res.status(201).json(newBooking);

            // FIRE-AND-FORGET: all email notifications sent after response
            const emailData: BookingEmailData = {
                bookingId: newBooking.id,
                playerName: user.name,
                playerEmail: user.email,
                userRole: user.role,
                courtName: facility.name,
                date: bookingDate,
                startTime,
                duration: Number(duration),
                amount: Number(amount),
                coachName: coach?.name
            };

            sendBookingConfirmationToPlayer(emailData).catch(e => console.error("Player booking email error:", e));

            // Fetch admins and notify all in parallel
            AppDataSource.getRepository(User)
                .find({ where: { role: UserRole.ADMIN }, select: ["email"] })
                .then(admins => Promise.all(admins.map(a => sendBookingNotificationToAdmin(emailData, a.email))))
                .catch(e => console.error("Admin booking email error:", e));

            if (coach) {
                sendBookingNotificationToCoach(emailData, coach.email).catch(e => console.error("Coach booking email error:", e));
            }

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

            // Respond immediately
            res.json(booking);

            // Handle side-effects in background (fire-and-forget)
            if (status === BookingStatus.CONFIRMED) {
                const emailData: BookingEmailData = {
                    bookingId: booking.id,
                    playerName: booking.user.name,
                    playerEmail: booking.user.email,
                    userRole: booking.user.role,
                    courtName: booking.facility.name,
                    date: new Date(booking.bookingDate).toISOString().split('T')[0],
                    startTime: booking.startTime,
                    duration: booking.duration,
                    amount: parseFloat(booking.amount as any),
                    coachName: booking.coach?.name
                };
                sendBookingApprovedToPlayer(emailData).catch(e => console.error("Approval email error:", e));
                if (booking.coach) {
                    sendBookingApprovedToCoach(emailData, booking.coach.email).catch(e => console.error("Coach approval email error:", e));
                }
            } else if (status === BookingStatus.CANCELLED) {
                AppDataSource.getRepository(Payment)
                    .findOne({ where: { booking: { id: booking.id } } })
                    .then(async payment => {
                        if (payment && payment.status === PaymentStatus.COMPLETED) {
                            payment.status = PaymentStatus.REFUNDED;
                            await AppDataSource.getRepository(Payment).save(payment);
                            console.log(`Payment ${payment.transactionId} refunded for cancelled booking ${booking.id}`);
                        }
                    })
                    .catch(e => console.error("Refund processing error:", e));
            }
        } catch (error) {
            console.error("Update booking status error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
