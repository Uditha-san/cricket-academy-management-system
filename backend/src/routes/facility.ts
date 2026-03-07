import { Router } from "express";
import { FacilityController } from "../controllers/FacilityController";

const router = Router();

router.get("/machines", FacilityController.getMachines);
router.get("/courts", FacilityController.getCourts);

export default router;
