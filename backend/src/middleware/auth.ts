import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        res.status(401).json({ message: "No token, authorization denied" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "scc_academy_secure_jwt_secret");
        (req as AuthRequest).user = decoded as any;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};
