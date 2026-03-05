import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { Feedback } from "../entities/Feedback";
import { Message } from "../entities/Message";
import { UserRole } from "../entities/User";

export class UserController {
    static async getProfile(req: Request, res: Response): Promise<void> {
        // @ts-ignore - userId attached by auth middleware
        const userId = req.user.userId;

        try {
            const user = await AppDataSource.getRepository(User).findOne({
                where: { id: userId },
                select: ["id", "name", "email", "phone", "role", "joinDate"],
                relations: ["performance", "playerProfile", "coachProfile", "adminProfile", "matchPerformances"]
            });

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            res.json(user);
        } catch (error) {
            console.error("Get profile error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async updateProfile(req: Request, res: Response): Promise<void> {
        // @ts-ignore - userId attached by auth middleware
        const userId = req.user.userId;
        const { name, phone, battingStyle, bowlingStyle, preferredPosition, address, emergencyContact, dateOfBirth } = req.body;

        try {
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({
                where: { id: userId },
                relations: ["playerProfile", "coachProfile", "adminProfile"]
            });

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            // Update allowed fields
            if (name) user.name = name;
            if (phone) user.phone = phone;

            if (user.playerProfile) {
                if (dateOfBirth) user.playerProfile.dateOfBirth = dateOfBirth;
                if (battingStyle) user.playerProfile.battingStyle = battingStyle;
                if (bowlingStyle) user.playerProfile.bowlingStyle = bowlingStyle;
                if (preferredPosition) user.playerProfile.preferredPosition = preferredPosition;
                if (address) user.playerProfile.address = address;
                if (emergencyContact) user.playerProfile.emergencyContact = emergencyContact;
            }

            await userRepository.save(user);

            res.json({ message: "Profile updated successfully", user });
        } catch (error) {
            console.error("Update profile error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getNotifications(req: Request, res: Response): Promise<void> {
        // @ts-ignore
        const userId = req.user.userId;

        try {
            const feedbackRepository = AppDataSource.getRepository(Feedback);
            const notifications = await feedbackRepository.find({
                where: { player: { id: userId } },
                relations: ["coach"],
                order: { createdAt: "DESC" }
            });

            // Map the data
            const result = notifications.map(n => ({
                id: n.id,
                area: n.area,
                feedback: n.feedback,
                rating: n.rating,
                isRead: n.isRead,
                createdAt: n.createdAt,
                coachName: n.coach?.name || "Unknown Coach"
            }));

            res.json(result);
        } catch (error) {
            console.error("Get notifications error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async markNotificationRead(req: Request, res: Response): Promise<void> {
        // @ts-ignore
        const userId = req.user.userId;
        const { id } = req.params;

        try {
            const feedbackRepository = AppDataSource.getRepository(Feedback);
            const notification = await feedbackRepository.findOne({
                where: { id: String(id), player: { id: userId } }
            });

            if (!notification) {
                res.status(404).json({ message: "Notification not found" });
                return;
            }

            notification.isRead = true;
            await feedbackRepository.save(notification);

            res.json({ message: "Notification marked as read" });
        } catch (error) {
            console.error("Mark notification read error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getCoaches(req: Request, res: Response): Promise<void> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const coaches = await userRepository.find({
                where: { role: UserRole.COACH },
                select: ["id", "name", "email", "avatar"]
            });
            res.json(coaches);
        } catch (error) {
            console.error("Get coaches error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async sendMessageToCoach(req: Request, res: Response): Promise<void> {
        // @ts-ignore
        const userId = req.user.userId;
        const { coachId, content } = req.body;

        if (!coachId || !content) {
            res.status(400).json({ message: "Coach ID and content are required." });
            return;
        }

        try {
            const userRepository = AppDataSource.getRepository(User);
            const messageRepository = AppDataSource.getRepository(Message);

            const sender = await userRepository.findOneBy({ id: userId });
            const receiver = await userRepository.findOneBy({ id: coachId, role: UserRole.COACH });

            if (!sender || !receiver) {
                res.status(404).json({ message: "Sender or receiver coach not found" });
                return;
            }

            const newMessage = new Message();
            newMessage.sender = sender;
            newMessage.receiver = receiver;
            newMessage.content = String(content);

            await messageRepository.save(newMessage);
            res.status(201).json({ message: "Message sent successfully", data: newMessage });
        } catch (error) {
            console.error("Send message error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getMessagesToCoaches(req: Request, res: Response): Promise<void> {
        // @ts-ignore
        const userId = req.user.userId;

        try {
            const messageRepository = AppDataSource.getRepository(Message);
            const messages = await messageRepository.find({
                where: { sender: { id: userId } },
                relations: ["receiver"],
                order: { createdAt: "DESC" }
            });

            const result = messages.map(m => ({
                id: m.id,
                coachName: m.receiver.name,
                content: m.content,
                isRead: m.isRead,
                createdAt: m.createdAt
            }));

            res.json(result);
        } catch (error) {
            console.error("Get messages error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
