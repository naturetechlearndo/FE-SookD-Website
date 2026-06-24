import { Router } from "express";

import {
    getReviews,
    getReviewById,
    getReviewsByItemId,
    getReviewsByUserId,
    getAverageRating,
    createReview,
    updateReview,
    deleteReview,
    getItemRating
} from "../controllers/reviewController";

const router = Router();

router.get("/", getReviews);

router.get("/:id", getReviewById);

router.get(
    "/item/:itemId",
    getReviewsByItemId
);

router.get(
    "/user/:userId",
    getReviewsByUserId
);

router.get(
    "/avg/:itemId",
    getAverageRating
);

router.get(
    "/rating/:itemId",
    getItemRating
);

router.post(
    "/",
    createReview
);

router.put(
    "/:id",
    updateReview
);

router.delete(
    "/:id",
    deleteReview
);

export default router;