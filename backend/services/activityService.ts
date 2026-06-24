import { Activity } from "../models/Activity";
import { getSheetData } from "./googleSheetService";

export async function getActivities(): Promise<Activity[]> {

    const data = await getSheetData("activities");

    return data.map((item: any): Activity => ({
        id: item.activity_id,
        name: item.activity_name,

        price: Number(item.activity_price),

        min_participants: Number(
            item.activity_min_participants
        ),

        max_participants: Number(
            item.activity_max_participants
        ),

        date: new Date(
            item.activity_date
        ),

        type: item.activity_type,

        participant_requirements:
            item.activity_participant_requirements
                ?.split(",")
                .map((requirement: string) =>
                    requirement.trim()
                ) || [],

        price_included_items:
            item.activity_price_included_items,

        location:
            item.activity_location,

        meeting_point:
            item.activity_meeting_point,

        description:
            item.activity_description,

        image:
            item.activity_image,

        note:
            item.activity_note,

        by:
            item.activity_by
    }));
}

export async function getActivityById(
    id: string
): Promise<Activity | undefined> {

    const activities = await getActivities();

    return activities.find(
        activity =>
            activity.id === id
    );
}
