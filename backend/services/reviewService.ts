import { Review } from "../models/Review";
import { getSheetData } from "./googleSheetService";

import { getProducts } from "./productService";
import { getActivities } from "./activityService";

import { generateNextId } from "../utils/idGenerator";

export async function getReviews(): Promise<Review[]> {

    const data = await getSheetData("Reviews");

    return data.map((item: any): Review => ({
        review_id: item.review_id,
        user_id: item.user_id,
        item_id: item.item_id,
        rating: Number(item.rating),
        comment: item.comment,
        review_date: item.review_date
    }));
}

export async function getReviewById(
    id: string
): Promise<Review | undefined> {

    const reviews = await getReviews();

    return reviews.find(
        review => review.review_id === id
    );
}

export async function getReviewsByItemId(
    itemId: string
): Promise<Review[]> {

    const reviews = await getReviews();

    return reviews.filter(
        review => review.item_id === itemId
    );
}

export async function getReviewsByUserId(
    userId: string
): Promise<Review[]> {

    const reviews = await getReviews();

    return reviews.filter(
        review => review.user_id === userId
    );
}

// delete //
export async function deleteReview(
    id: string
): Promise<boolean> {

    const response = await fetch(
        process.env.GAS_URL!,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "deleteReview",
                review_id: id
            })
        }
    );

    const result = await response.json();

    return result.success;
}

// update //
export async function updateReview(
    id: string,
    review: Partial<Review>
): Promise<Review> {

    const response = await fetch(
        process.env.GAS_URL!,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "updateReview",
                review_id: id,
                data: review
            })
        }
    );

    const result = await response.json();

    if (!result.success) {
        throw new Error("Update failed");
    }

    return result.review;
}

// create //
export async function createReview(
    reviewData: Omit<Review, "review_id">
): Promise<Review> {

    const reviews = await getReviews();

    console.log(reviews);

    const reviewId = generateNextId(
        reviews.map(r => r.review_id),
        "REV"
    );



    const newReview: Review = {
        review_id: reviewId,
        ...reviewData
    };


    console.log(newReview);
    const response =
        await fetch(
            process.env.GAS_URL!,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    action: "createReview",
                    data: newReview ?? {}
                })
            }
        );

    if (!response.ok) {
        throw new Error(
            "Failed to save review"
        );
    }


    return newReview;
}


// Review Rating //

export async function getItemReviews(
    itemId: string
) {

    const reviews = await getReviews();

    const products = await getProducts();

    const activities = await getActivities();

    console.log(products[0]);
    const product = products.find(
        p => p.id === itemId
    );
    console.log("here12", itemId);

    if (product) {
        console.log("here11");
        return {
            type: "product",
            item: product,
            reviews: reviews.filter(
                review =>
                    review.item_id === itemId
            )
        };
    }

    const activity =
        activities.find(
            a => a.id === itemId
        );

    if (activity) {
        // console.log("here13");

        return {
            type: "activity",
            item: activity,
            reviews: reviews.filter(
                review =>
                    review.item_id === itemId
            )
        };
    }

    return null;
}

// BY item_ID //
export async function getAverageRating(
    itemId: string
): Promise<number> {

    const reviews = await getReviewsByItemId(itemId);

    if (reviews.length === 0) {
        return 0;
    }

    const total =
        reviews.reduce(
            (sum, review) =>
                Number(sum) + Number(review.rating),
            0
        );

    return Number(
        (total / reviews.length)
            .toFixed(1)
    );
}
