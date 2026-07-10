import { Router } from "express";

import {
    getOrders,getOrderById,getOrdersByItemId,getOrdersByUserId,
    createOrder,deleteOrder,updateOrder,getImpactData
} from "../controllers/orderController";

import { verifyToken } from "../middlewares/authMiddleware";


const router = Router();

router.get("/", getOrders);
router.get("/impact", getImpactData);
router.get("/:id", getOrderById);

router.get( "/item/:itemId",getOrdersByItemId);

router.get("/user/:userId",getOrdersByUserId);

router.post("/",createOrder);

router.put("/:id",updateOrder);

router.delete("/:id",deleteOrder);
router.delete("/:id",verifyToken,deleteOrder);



export default router;