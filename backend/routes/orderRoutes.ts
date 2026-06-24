import { Router } from "express";

import {
    getOrders,getOrderById,getOrdersByItemId,getOrdersByUserId,
    createOrder,deleteOrder,updateOrder
} from "../controllers/orderController";

const router = Router();

router.get("/", getOrders);

router.get("/:id", getOrderById);

router.get(
    "/item/:itemId",
    getOrdersByItemId
);

router.get(
    "/user/:userId",
    getOrdersByUserId
);

router.post(
    "/",
    createOrder
);

router.put(
    "/:id",
    updateOrder
);

router.delete(
    "/:id",
    deleteOrder
);

export default router;