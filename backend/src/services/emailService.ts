import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const getEmailTemplate = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
        .header { background-color: #16a34a; padding: 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; background-color: #ffffff; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #e0e0e0; }
        .info-box { background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .badge { display: inline-block; padding: 4px 12px; background-color: #16a34a; color: white; border-radius: 20px; font-size: 12px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏏 SCC Academy of Cricket</h1>
        </div>
        <div class="content">
            <h2 style="color: #16a34a; margin-top: 0;">${title}</h2>
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} SCC Academy of Cricket. All rights reserved.</p>
            <p>123 Cricket Lane, Sportscity, SC 54321</p>
        </div>
    </div>
</body>
</html>
`;

export interface BookingEmailData {
    bookingId: string;
    playerName: string;
    playerEmail: string;
    courtName: string;
    date: string;
    startTime: string;
    duration: number;
    amount: number;
    coachName?: string;
}

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const buildBookingDetailsHtml = (data: BookingEmailData) => `
    <div class="info-box">
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td class="label" style="padding: 4px 0; border-bottom: 1px solid #e0e0e0;">Player</td><td style="padding: 4px 0; border-bottom: 1px solid #e0e0e0;">${data.playerName}</td></tr>
            <tr><td class="label" style="padding: 4px 0; border-bottom: 1px solid #e0e0e0;">Court</td><td style="padding: 4px 0; border-bottom: 1px solid #e0e0e0;">${data.courtName}</td></tr>
            <tr><td class="label" style="padding: 4px 0; border-bottom: 1px solid #e0e0e0;">Date</td><td style="padding: 4px 0; border-bottom: 1px solid #e0e0e0;">${formatDate(data.date)}</td></tr>
            <tr><td class="label" style="padding: 4px 0; border-bottom: 1px solid #e0e0e0;">Start Time</td><td style="padding: 4px 0; border-bottom: 1px solid #e0e0e0;">${data.startTime}</td></tr>
            <tr><td class="label" style="padding: 4px 0; border-bottom: 1px solid #e0e0e0;">Duration</td><td style="padding: 4px 0; border-bottom: 1px solid #e0e0e0;">${data.duration} hour(s)</td></tr>
            ${data.coachName ? `<tr><td class="label" style="padding: 4px 0; border-bottom: 1px solid #e0e0e0;">Assigned Coach</td><td style="padding: 4px 0; border-bottom: 1px solid #e0e0e0;">${data.coachName}</td></tr>` : ''}
            <tr><td class="label" style="padding: 4px 0;">Total Amount</td><td style="padding: 4px 0;"><strong>Rs. ${data.amount.toLocaleString()}</strong></td></tr>
        </table>
    </div>
`;

export const sendBookingConfirmationToPlayer = async (data: BookingEmailData) => {
    const content = `
        <p>Dear <strong>${data.playerName}</strong>,</p>
        <p>Your court booking has been received and is currently <span class="badge">Pending</span> approval.</p>
        ${buildBookingDetailsHtml(data)}
        <p>You will receive another email once your booking is confirmed by our staff.</p>
        <p>Thank you for choosing SCC Academy!</p>
    `;

    await transporter.sendMail({
        from: `"SCC Academy" <${process.env.EMAIL_USER}>`,
        to: data.playerEmail,
        subject: '🏏 Booking Received - SCC Academy',
        html: getEmailTemplate('Booking Confirmation', content)
    });
};

export const sendBookingNotificationToAdmin = async (data: BookingEmailData, adminEmail: string) => {
    const content = `
        <p>A new court booking has been made. Please review and confirm.</p>
        ${buildBookingDetailsHtml(data)}
        <p>Log in to the Admin Dashboard to confirm or cancel this booking.</p>
    `;

    await transporter.sendMail({
        from: `"SCC Academy" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `🏏 New Booking Alert: ${data.playerName} - ${data.courtName}`,
        html: getEmailTemplate('New Booking Request', content)
    });
};

export const sendBookingNotificationToCoach = async (data: BookingEmailData, coachEmail: string) => {
    const content = `
        <p>Dear Coach <strong>${data.coachName}</strong>,</p>
        <p>A player has booked a practice session and requested your coaching.</p>
        ${buildBookingDetailsHtml(data)}
        <p>Please log in to your Coach Dashboard to approve or cancel this session.</p>
    `;

    await transporter.sendMail({
        from: `"SCC Academy" <${process.env.EMAIL_USER}>`,
        to: coachEmail,
        subject: `🏏 New Practice Session Assigned: ${data.playerName}`,
        html: getEmailTemplate('New Practice Session', content)
    });
};

export const sendBookingApprovedToPlayer = async (data: BookingEmailData) => {
    const content = `
        <p>Dear <strong>${data.playerName}</strong>,</p>
        <p>Great news! Your court booking has been <strong style="color:#16a34a;">Confirmed</strong> by our admin team.</p>
        ${buildBookingDetailsHtml(data)}
        <p>Please arrive at the court at least 10 minutes before your session. Enjoy your game! 🏏</p>
        <p>Thank you for choosing SCC Academy!</p>
    `;

    await transporter.sendMail({
        from: `"SCC Academy" <${process.env.EMAIL_USER}>`,
        to: data.playerEmail,
        subject: '✅ Booking Confirmed - SCC Academy',
        html: getEmailTemplate('Booking Confirmed!', content)
    });
};

export const sendBookingApprovedToCoach = async (data: BookingEmailData, coachEmail: string) => {
    const content = `
        <p>Dear Coach <strong>${data.coachName}</strong>,</p>
        <p>A practice session assigned to you has been <strong style="color:#16a34a;">Confirmed</strong> by the admin. Please be ready!</p>
        ${buildBookingDetailsHtml(data)}
        <p>Log in to your Coach Dashboard to view all your upcoming sessions.</p>
    `;

    await transporter.sendMail({
        from: `"SCC Academy" <${process.env.EMAIL_USER}>`,
        to: coachEmail,
        subject: `✅ Session Confirmed: ${data.playerName} - ${data.courtName}`,
        html: getEmailTemplate('Session Confirmed', content)
    });
};
