export interface Promotion {
    promotion_id: string;
    promotion_name: string;
    condition_type: string;
    product_select: string;
    condition_value: number;
    reward_item_id: string;
    status: string;
    start_date: Date;
    end_date: Date;
}