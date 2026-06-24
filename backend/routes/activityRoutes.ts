import { Router } from "express";
import * as activityController from "../controllers/activityController";

const router = Router();

router.get("/", activityController.getActivities);
router.get("/:id", activityController.getActivityById);

export default router; 