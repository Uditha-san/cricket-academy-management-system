import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    if (authReq.user && authReq.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
};
