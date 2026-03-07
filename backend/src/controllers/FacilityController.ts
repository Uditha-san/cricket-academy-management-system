import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Facility, FacilityType } from "../entities/Facility";

export class FacilityController {
    static async getMachines(req: Request, res: Response): Promise<void> {
        try {
            const facilityRepository = AppDataSource.getRepository(Facility);
            const machines = await facilityRepository.find({
                where: { type: FacilityType.BOWLING_MACHINE, isActive: true },
                order: { pricePerHour: "ASC" }
            });
            res.json(machines);
        } catch (error) {
            console.error("Get machines error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getCourts(req: Request, res: Response): Promise<void> {
        try {
            const facilityRepository = AppDataSource.getRepository(Facility);
            const courts = await facilityRepository.find({
                where: [
                    { type: FacilityType.NET, isActive: true },
                    { type: FacilityType.PITCH, isActive: true },
                    { type: FacilityType.GYM, isActive: true }
                ],
                order: { pricePerHour: "ASC" }
            });
            res.json(courts);
        } catch (error) {
            console.error("Get courts error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
