import { Request, Response, NextFunction } from "express";

export const coachMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    // @ts-ignore
    const user = req.user;

    if (!user || user.role !== "coach") {
        res.status(403).json({ message: "Access denied: Coach privileges required" });
        return;
    }

    next();
};
