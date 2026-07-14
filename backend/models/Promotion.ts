export interface Promotion {
    id: string;
    name: string;
    condition_type: string;
    select: string;
    condition_value: number;
    reward_item_id: string;
    status: string;
    start_date: Date;
    end_date: Date;
}
