import { Promotion } from "../models/Promotion";
import { getSheetData } from "./googleSheetService";


export async function getPromotions(): Promise<Promotion[]> {
    const data = await getSheetData("promotion");

    return data.map((item: any) => ({
        id: item.promotion_id,
        name: item.promotion_name,
        condition_type: item.condition_type,
        select: item.product_select,
        condition_value: item.condition_value,
        reward_item_id: item.reward_item_id,
        status: item.status,
        start_date: new Date(item.start_date),
        end_date: new Date(item.end_date)
    }));
}

export async function getPromotionById(
    id: string
) {
    const promotions = await getPromotions();

    return promotions.find(
        promotion => promotion.id === id
    );
}