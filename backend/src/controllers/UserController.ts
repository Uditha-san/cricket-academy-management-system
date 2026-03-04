import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";

export class UserController {
    static async getProfile(req: Request, res: Response): Promise<void> {
        // @ts-ignore - userId attached by auth middleware
        const userId = req.user.userId;

        try {
            const user = await AppDataSource.getRepository(User).findOne({
                where: { id: userId },
                select: ["id", "name", "email", "phone", "role", "joinDate", "battingStyle", "bowlingStyle", "preferredPosition", "address", "emergencyContact"]
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
        const { name, phone, battingStyle, bowlingStyle, preferredPosition, address, emergencyContact } = req.body;

        try {
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOneBy({ id: userId });

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            // Update allowed fields
            if (name) user.name = name;
            if (phone) user.phone = phone;
            if (battingStyle) user.battingStyle = battingStyle;
            if (bowlingStyle) user.bowlingStyle = bowlingStyle;
            if (preferredPosition) user.preferredPosition = preferredPosition;
            if (address) user.address = address;
            if (emergencyContact) user.emergencyContact = emergencyContact;

            await userRepository.save(user);

            res.json({ message: "Profile updated successfully", user });
        } catch (error) {
            console.error("Update profile error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
