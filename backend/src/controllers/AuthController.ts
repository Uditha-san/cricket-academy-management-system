import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User, UserRole, UserStatus } from "../entities/User";
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

export class AuthController {
    static async register(req: Request, res: Response): Promise<void> {
        const { name, email, password, phone, role } = req.body;

        try {
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
            user.name = name;
            user.email = email;
            user.password = await bcrypt.hash(password, 10);
            user.phone = phone;
            user.role = role || UserRole.PLAYER; // Default to player if not specified
            user.status = UserStatus.ACTIVE;
            user.verificationToken = verificationToken;
            user.isVerified = false; // Not verified yet

            const errors = await validate(user);
            if (errors.length > 0) {
                res.status(400).json(errors);
                return;
            }

            await userRepository.save(user);

            // Send Verification Email
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Verify Your Email - SCC Academy',
                html: `
                    <h1>Welcome to SCC Academy!</h1>
                    <p>Your verification code is:</p>
                    <h2 style="color: #4CAF50; letter-spacing: 5px;">${verificationToken}</h2>
                    <p>Please enter this code on the verification page to complete your registration.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                `
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
                select: ["id", "email", "password", "role", "status", "isVerified", "verificationToken"]
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
                process.env.JWT_SECRET || "your-secret-key",
                { expiresIn: "1h" }
            );

            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
