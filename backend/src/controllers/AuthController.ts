import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User, UserRole, UserStatus } from "../entities/User";
import { PlayerProfile } from "../entities/PlayerProfile";
import { CoachProfile } from "../entities/CoachProfile";
import { AdminProfile } from "../entities/AdminProfile";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validate } from "class-validator";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";

const userRepository = AppDataSource.getRepository(User);

const transporter = nodemailer.createTransport({
    service: 'gmail', // Use 'gmail' or configure host/port manually
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
        .otp-box { background-color: #f0fdf4; border: 2px dashed #16a34a; padding: 15px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #16a34a; letter-spacing: 5px; margin: 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #16a34a; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SCC Academy of Cricket</h1>
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

export class AuthController {
    static async register(req: Request, res: Response): Promise<void> {
        const { name, email, password, phone, role, adminCode, dateOfBirth, battingStyle, bowlingStyle, preferredPosition, address, emergencyContact } = req.body;

        try {
            // Input validation
            const validationErrors: string[] = [];

            // Validate name
            if (!name || typeof name !== 'string') {
                validationErrors.push('Name is required');
            } else if (name.trim().length < 2) {
                validationErrors.push('Name must be at least 2 characters');
            } else if (name.length > 50) {
                validationErrors.push('Name must be less than 50 characters');
            } else if (!/^[a-zA-Z\s]+$/.test(name)) {
                validationErrors.push('Name can only contain letters and spaces');
            }

            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || typeof email !== 'string') {
                validationErrors.push('Email is required');
            } else if (!emailRegex.test(email)) {
                validationErrors.push('Please enter a valid email address');
            }

            // Validate password
            if (!password || typeof password !== 'string') {
                validationErrors.push('Password is required');
            } else {
                if (password.length < 8) {
                    validationErrors.push('Password must be at least 8 characters');
                }
                if (!/[A-Z]/.test(password)) {
                    validationErrors.push('Password must contain at least one uppercase letter');
                }
                if (!/[a-z]/.test(password)) {
                    validationErrors.push('Password must contain at least one lowercase letter');
                }
                if (!/[0-9]/.test(password)) {
                    validationErrors.push('Password must contain at least one number');
                }
            }

            // Validate phone
            const phoneRegex = /^[+]?[\d\s-]{10,}$/;
            if (!phone || typeof phone !== 'string') {
                validationErrors.push('Phone number is required');
            } else if (!phoneRegex.test(phone)) {
                validationErrors.push('Please enter a valid phone number');
            }

            // Validate role
            const validRoles = [UserRole.PLAYER, UserRole.COACH, UserRole.ADMIN];
            if (!role || !validRoles.includes(role)) {
                validationErrors.push('Invalid role selected');
            }

            // Validate player required fields
            if (role === UserRole.PLAYER) {
                if (!dateOfBirth) validationErrors.push('Date of birth is required for players');
                if (!address) validationErrors.push('Address is required for players');
                if (!emergencyContact) validationErrors.push('Emergency contact is required for players');
            }

            // Return validation errors if any
            if (validationErrors.length > 0) {
                res.status(400).json({
                    message: 'Validation failed',
                    errors: validationErrors
                });
                return;
            }

            // Validate Admin Secret Code if registering as Admin
            if (role === UserRole.ADMIN) {
                if (adminCode !== process.env.ADMIN_SECRET_CODE) {
                    res.status(403).json({ message: "Invalid Admin Secret Code" });
                    return;
                }
            }

            let user = await userRepository.findOne({ where: { email } });

            if (user) {
                if (user.isVerified) {
                    res.status(400).json({ message: "User already exists" });
                    return;
                }
                // If user exists but not verified, we will overwrite their data and resend verification
            } else {
                user = new User();
            }

            // Generate 6-digit OTP
            const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

            // Setup user properties (either new or overwriting existing unverified)
            user.name = name.trim();
            user.email = email.toLowerCase().trim();
            user.password = await bcrypt.hash(password, 10);
            user.phone = phone.trim();
            user.role = role || UserRole.PLAYER; // Default to player if not specified
            user.status = UserStatus.ACTIVE;
            user.verificationToken = verificationToken;
            user.isVerified = false; // Not verified yet

            if (user.role === UserRole.PLAYER) {
                user.playerProfile = new PlayerProfile();
                if (dateOfBirth) user.playerProfile.dateOfBirth = dateOfBirth;
                if (battingStyle) user.playerProfile.battingStyle = battingStyle;
                if (bowlingStyle) user.playerProfile.bowlingStyle = bowlingStyle;
                if (preferredPosition) user.playerProfile.preferredPosition = preferredPosition;
                if (address) user.playerProfile.address = address;
                if (emergencyContact) user.playerProfile.emergencyContact = emergencyContact;
            } else if (user.role === UserRole.COACH) {
                user.coachProfile = new CoachProfile();
            } else if (user.role === UserRole.ADMIN) {
                user.adminProfile = new AdminProfile();
            }

            const errors = await validate(user);
            if (errors.length > 0) {
                res.status(400).json(errors);
                return;
            }

            await userRepository.save(user);

            // Send Verification Email
            const emailContent = `
                <p>Hello ${name},</p>
                <p>Thank you for registering with SCC Academy as a <strong>${user.role}</strong>.</p>
                <p>To complete your registration, please verify your email address using the code below:</p>
                <div class="otp-box">
                    <p class="otp-code">${verificationToken}</p>
                </div>
                <p>Enter this code on the verification page to activate your account.</p>
                <p>If you did not request this, please ignore this email.</p>
            `;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Verify Your Email - SCC Academy',
                html: getEmailTemplate('Email Verification', emailContent)
            };

            await transporter.sendMail(mailOptions);
            console.log(`Verification OTP sent to ${email}: ${verificationToken}`);

            res.status(201).json({
                message: "User created. Please check your email for the verification code."
            });
        } catch (error) {
            console.error("Registration error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async verifyEmail(req: Request, res: Response): Promise<void> {
        const { email, otp } = req.body;

        if (!email || !otp) {
            res.status(400).json({ message: "Email and OTP are required" });
            return;
        }

        try {
            const user = await userRepository.findOne({
                where: { email },
                select: ["id", "name", "email", "password", "role", "status", "isVerified", "verificationToken"]
            });

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            if (user.isVerified) {
                res.status(400).json({ message: "Email is already verified" });
                return;
            }

            console.log(`[Verify Debug] Verifying user: ${email}`);
            console.log(`[Verify Debug] Received OTP: '${otp}' (Type: ${typeof otp})`);
            console.log(`[Verify Debug] Stored Token: '${user.verificationToken}' (Type: ${typeof user.verificationToken})`);

            if (user.verificationToken !== otp) {
                console.log(`[Verify Debug] OTP Mismatch!`);
                res.status(400).json({ message: "Invalid verification code" });
                return;
            }

            user.isVerified = true;
            user.verificationToken = ""; // Clear token
            await userRepository.save(user);

            // Send Welcome Email
            const welcomeContent = `
                <p>Hello ${user.name},</p>
                <p>Congratulations! Your email has been successfully verified.</p>
                <p>Welcome to the <strong>SCC Academy of Cricket</strong> family. We are excited to have you on board.</p>
                <p>You can now log in to your dashboard to book courts, view stats, and manage your profile.</p>
                <center>
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" class="button">Login to your Account</a>
                </center>
                <p style="margin-top: 20px;">See you on the pitch!</p>
            `;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Welcome to SCC Academy! 🏏',
                html: getEmailTemplate('Welcome Aboard!', welcomeContent)
            };

            await transporter.sendMail(mailOptions);
            console.log(`Welcome email sent to ${email}`);

            res.json({ message: "Email verified successfully. You can now login." });
        } catch (error) {
            console.error("Verification error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async login(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body;

        try {
            const user = await userRepository
                .createQueryBuilder("user")
                .addSelect("user.password")
                .where("user.email = :email", { email })
                .getOne();

            if (!user) {
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }

            if (!user.isVerified) {
                res.status(403).json({ message: "Please verify your email first." });
                return;
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }

            const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET || "scc_academy_secure_jwt_secret",
                { expiresIn: "1h" }
            );

            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async forgotPassword(req: Request, res: Response): Promise<void> {
        const { email } = req.body;

        try {
            const user = await userRepository.findOne({ where: { email } });
            if (!user) {
                // Return success even if user not found to prevent enumeration
                res.status(200).json({ message: "If your email is registered, you will receive a password reset code." });
                return;
            }

            // Generate 6-digit OTP
            const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
            const expires = new Date();
            expires.setMinutes(expires.getMinutes() + 15); // Expires in 15 mins

            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = expires;
            await userRepository.save(user);

            // Send Reset Email
            const emailContent = `
                <p>Hello ${user.name},</p>
                <p>You requested a password reset. Please use the code below to reset your password:</p>
                <div class="otp-box">
                    <p class="otp-code">${resetToken}</p>
                </div>
                <p>This code will expire in 15 minutes.</p>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            `;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Password Reset Request - SCC Academy',
                html: getEmailTemplate('Reset Your Password', emailContent)
            };

            await transporter.sendMail(mailOptions);

            res.status(200).json({ message: "If your email is registered, you will receive a password reset code." });
        } catch (error) {
            console.error("Forgot Password error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async resetPassword(req: Request, res: Response): Promise<void> {
        const { email, otp, newPassword } = req.body;

        try {
            const user = await userRepository.findOne({
                where: { email },
                select: ["id", "name", "email", "resetPasswordToken", "resetPasswordExpires"]
            });

            if (!user) {
                res.status(400).json({ message: "Invalid request" });
                return;
            }

            if (!user.resetPasswordToken || !user.resetPasswordExpires) {
                res.status(400).json({ message: "No reset request found" });
                return;
            }

            if (user.resetPasswordToken !== otp) {
                res.status(400).json({ message: "Invalid code" });
                return;
            }

            if (user.resetPasswordExpires < new Date()) {
                res.status(400).json({ message: "Code has expired" });
                return;
            }

            // Update password
            user.password = await bcrypt.hash(newPassword, 10);
            user.resetPasswordToken = ""; // Clear token
            // We set the date to something in the past to "clear" it properly
            user.resetPasswordExpires = new Date(0);

            await userRepository.save(user);

            // Send Confirmation Email
            const emailContent = `
                <p>Hello ${user.name},</p>
                <p>Your password has been successfully reset.</p>
                <p>You can now log in with your new password.</p>
            `;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Password Reset Successful - SCC Academy',
                html: getEmailTemplate('Password Changed', emailContent)
            };

            await transporter.sendMail(mailOptions);

            res.status(200).json({ message: "Password reset successfully. You can now login." });
        } catch (error) {
            console.error("Reset Password error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async guestLogin(req: Request, res: Response): Promise<void> {
        const { name, email, phone } = req.body;

        if (!name || !email || !phone) {
            res.status(400).json({ message: "Name, email, and phone are required." });
            return;
        }

        try {
            let user = await userRepository.findOne({ where: { email } });

            if (user && user.role !== UserRole.GUEST) {
                // Registered player/coach/admin should use regular login
                res.status(409).json({ message: "An account with this email already exists. Please log in instead." });
                return;
            }

            if (!user) {
                // Create a new guest user
                user = new User();
                user.name = name.trim();
                user.email = email.toLowerCase().trim();
                user.phone = phone.trim();
                user.role = UserRole.GUEST;
                user.status = UserStatus.ACTIVE;
                user.isVerified = true; // Guests skip email verification
                user.password = await bcrypt.hash(uuidv4(), 10); // Random un-guessable password
                user.verificationToken = "";
                await userRepository.save(user);
            } else {
                // Update existing guest's name/phone in case they changed
                user.name = name.trim();
                user.phone = phone.trim();
                await userRepository.save(user);
            }

            const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET || "scc_academy_secure_jwt_secret",
                { expiresIn: "8h" }
            );

            res.json({
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });
        } catch (error) {
            console.error("Guest login error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
