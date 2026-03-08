import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Equipment } from "../entities/Equipment";

const equipmentRepo = AppDataSource.getRepository(Equipment);

export class EquipmentController {
    static async getAll(req: Request, res: Response) {
        try {
            const items = await equipmentRepo.find({ order: { name: "ASC" } });
            return res.json(items);
        } catch (err) {
            console.error("Fetch equipment error:", err);
            return res.status(500).json({ message: "Failed to fetch equipment." });
        }
    }

    static async getOne(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const item = await equipmentRepo.findOneBy({ id });
            if (!item) return res.status(404).json({ message: "Item not found." });
            return res.json(item);
        } catch (err) {
            return res.status(500).json({ message: "Error fetching item." });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const { name, category, price, stock, image, description } = req.body;
            const newItem = equipmentRepo.create({ name, category, price, stock, image, description });
            await equipmentRepo.save(newItem);
            return res.status(201).json(newItem);
        } catch (err) {
            console.error("Create equipment error:", err);
            return res.status(500).json({ message: "Failed to create equipment." });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            let item = await equipmentRepo.findOneBy({ id });
            if (!item) return res.status(404).json({ message: "Item not found." });

            const { name, category, price, stock, image, description } = req.body;
            equipmentRepo.merge(item, { name, category, price, stock, image, description });
            await equipmentRepo.save(item);
            return res.json(item);
        } catch (err) {
            console.error("Update equipment error:", err);
            return res.status(500).json({ message: "Failed to update equipment." });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await equipmentRepo.delete(id);
            if (result.affected === 0) return res.status(404).json({ message: "Item not found." });
            return res.json({ message: "Item deleted successfully." });
        } catch (err) {
            console.error("Delete equipment error:", err);
            return res.status(500).json({ message: "Failed to delete equipment." });
        }
    }
}
