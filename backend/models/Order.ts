export interface Order {
    order_id: string;
    user_id: string;
    order_date: Date;

    item_id: string;
    quantity: number;
    total_price: number;

    order_status:
        | "pending"
        | "paid"
        | "shipping"
        | "completed"
        | "cancelled";

    shipping_address: string;

    applied_promotion_id?: string;
}