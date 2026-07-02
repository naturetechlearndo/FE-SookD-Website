export interface Review {
    review_id: string;
    user_id: string;

    item_id: string;
    item_type?: "product" | "activity";

    rating: Number;
    comment: string;
    review_date?: string;
}