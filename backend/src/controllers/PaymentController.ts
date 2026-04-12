import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Payment, PaymentMethod, PaymentStatus } from "../entities/Payment";
import { Booking, BookingStatus } from "../entities/Booking";
import { Rental, RentalStatus } from "../entities/Rental";
import { AuthRequest } from "../middleware/auth";
import {
    sendBookingApprovedToPlayer,
    sendBookingApprovedToCoach,
    BookingEmailData
} from "../services/emailService";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const sendRentalConfirmedToPlayer = async (data: any) => {
    await transporter.sendMail({
        from: `"SCC Academy" <${process.env.EMAIL_USER}>`,
        to: data.playerEmail,
        subject: "✅ Machine Rental Confirmed - SCC Academy",
        html: `<p>Dear <strong>${data.playerName}</strong>, your rental of <strong>${data.machineName}</strong> on ${data.date} at ${data.startTime} for ${data.duration}h has been <strong style="color:#16a34a;">Confirmed</strong>. Total: Rs.${data.amount}. See you there!</p>`
    });
};

export class PaymentController {
    static async processPayment(req: Request, res: Response): Promise<void> {
        const userId = (req as AuthRequest).user?.userId;
        const { amount, paymentMethod, referenceType, referenceId, transactionId } = req.body;

        try {
            const paymentRepository = AppDataSource.getRepository(Payment);
            const bookingRepository = AppDataSource.getRepository(Booking);
            const rentalRepository = AppDataSource.getRepository(Rental);

            let booking: Booking | null = null;
            let rental: Rental | null = null;

            if (referenceType === 'booking') {
                booking = await bookingRepository.findOne({
                    where: { id: referenceId },
                    relations: ["user", "facility", "coach"]
                });

                if (!booking) {
                    res.status(404).json({ message: "Booking not found" });
                    return;
                }
            } else if (referenceType === 'rental') {
                rental = await rentalRepository.findOne({
                    where: { id: referenceId },
                    relations: ["user", "facility"]
                });

                if (!rental) {
                    res.status(404).json({ message: "Rental not found" });
                    return;
                }
            } else {
                res.status(400).json({ message: "Invalid reference type" });
                return;
            }

            // Create Payment record
            const newPayment = paymentRepository.create({
                amount: Number(amount),
                method: paymentMethod as PaymentMethod,
                status: PaymentStatus.COMPLETED,
                transactionId: transactionId || `txn_${Date.now()}`,
                booking: booking || undefined,
                rental: rental || undefined
            });

            await paymentRepository.save(newPayment);

            // Update Booking or Rental status to CONFIRMED
            if (booking) {
                booking.status = BookingStatus.CONFIRMED;
                await bookingRepository.save(booking);

                // Send confirmation emails
                try {
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

                    await sendBookingApprovedToPlayer(emailData);
                    if (booking.coach) {
                        await sendBookingApprovedToCoach(emailData, booking.coach.email);
                    }
                } catch (emailError) {
                    console.error("Booking payment confirmation email error:", emailError);
                }
            } else if (rental) {
                rental.status = RentalStatus.CONFIRMED;
                await rentalRepository.save(rental);

                // Send confirmation emails
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
                } catch (emailError) {
                    console.error("Rental payment confirmation email error:", emailError);
                }
            }

            res.status(200).json({ message: "Payment processed successfully", payment: newPayment });
        } catch (error) {
            console.error("Process payment error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
