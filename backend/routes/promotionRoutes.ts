import { Router } from "express";
import * as promotionController from "../controllers/promotionController"

const router = Router();

router.get("/", promotionController.getPromotions);
router.get("/:id", promotionController.getPromotionById);

export default router; 