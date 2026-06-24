import { Request, Response } from "express";
import * as promotionService from "../services/promotionService"

export async function getPromotions(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const activities = await promotionService.getPromotions();

        res.status(200).json(activities);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to fetch promotions"
        });
    }
}


export async function getPromotionById(
    req: Request,
    res: Response
) {
    try {
        const id = String(req.params.id);
        console.log("id",id);

        const promotion =
            await promotionService.getPromotionById(id);

        if (!promotion) {
            res.status(404).json({
                message: "promotion not found"
            });
            return;
        }

        res.status(200).json(promotion);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get promotion"
        });
    }
}

