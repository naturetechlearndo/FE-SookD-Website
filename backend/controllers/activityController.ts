import { Request, Response } from "express";
import * as activityService from "../services/activityService";

export async function getActivities(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const activities = await activityService.getActivities();

        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch activities"
        });
    }
}


export async function getActivityById(
    req: Request,
    res: Response
) {
    try {
        const id = String(req.params.id);
        console.log("id",id);

        const activity =
            await activityService.getActivityById(id);

        if (!activity) {
            res.status(404).json({
                message: "activity not found"
            });
            return;
        }

        res.status(200).json(activity);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get activity"
        });
    }
}

