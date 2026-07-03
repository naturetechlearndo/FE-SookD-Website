import { Request, Response } from "express";
import * as reviewService from "../services/reviewService";

export async function getReviews(
    req: Request,
    res: Response
) {
    try {
        const reviews =
            await reviewService.getReviews();

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get reviews"
        });
    }
}

export async function getReviewById(
    req: Request,
    res: Response
) {
    try {
        const id = String(req.params.id);

        const review =
            await reviewService.getReviewById(id);

        if (!review) {
            res.status(404).json({
                message: "Review not found"
            });
            return;
        }

        res.status(200).json(review);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get review"
        });
    }
}

export async function getReviewsByItemId(
    req: Request,
    res: Response
) {
    try {
        const itemId =
            String(req.params.itemId);

        const reviews =
            await reviewService
                .getReviewsByItemId(itemId);

        res.status(200).json(reviews);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get reviews"
        });
    }
}

export async function getReviewsByUserId(
    req: Request,
    res: Response
) {
    try {
        const userId =
            String(req.params.userId);

        const reviews =
            await reviewService
                .getReviewsByUserId(userId);

        res.status(200).json(reviews);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get reviews"
        });
    }
}

export async function getAverageRating(
    req: Request,
    res: Response
) {
    try {
        const itemId = String(req.params.itemId);

        const averageRating = await reviewService.getAverageRating(itemId);
        // const averageRating = await reviewService.getItemReviews(itemId);

        res.status(200).json({
            itemId,
            averageRating
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get rating"
        });
    }
}

export async function getItemRating(
    req: Request,
    res: Response
) {
    try {
        const itemId = String(req.params.itemId);

        // const averageRating = await reviewService.getAverageRating(itemId);
        const averageRating = await reviewService.getItemReviews(itemId);

        res.status(200).json({
            itemId,
            averageRating
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get rating"
        });
    }
}

export async function createReview(
    req: Request,
    res: Response
) {
    try {

        const review =
            await reviewService.createReview(
                req.body
            );

        res.status(201).json(review);

    } catch (error) {

        console.error("CREATE REVIEW ERROR:", error);

        res.status(500).json({
            message: "Failed to create review",
            error: String(error)
        });
    }
}

export async function updateReview(
    req: Request,
    res: Response
) {
    try {
        const id = String(req.params.id);

        const review =
            await reviewService
                .updateReview(id, req.body);

        res.status(200).json(review);

    } catch (error) {
        console.log("error",error);
        res.status(500).json({
            message: "Failed to update review"
        });
    }
}

export async function deleteReview(
    req: Request,
    res: Response
) {
    try {
        const id = String(req.params.id);

        await reviewService
            .deleteReview(id);

        res.status(200).json({
            message: "Review deleted"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete review"
        });
    }
}