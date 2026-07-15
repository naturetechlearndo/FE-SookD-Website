import { Request, Response } from "express";
import * as orderService from "../services/orderService";

export async function getOrders(
    _req: Request,
    res: Response
) {
    try {
        const Orders =
            await orderService.getOrders();

        res.status(200).json(Orders);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get orders"
        });
    }
}

export async function getOrderById(
    req: Request,
    res: Response
) {
    try {
        const id = String(req.params.id);

        const order =
            await orderService.getOrderById(id);

        if (!order) {
            res.status(404).json({
                message: "Order not found"
            });
            return;
        }

        res.status(200).json(order);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get order"
        });
    }
}

export async function getOrdersById(
    req: Request,
    res: Response
) {
    try {
        const id = String(req.params.id);

        // console.log("ID:",id);

        const orders =
            await orderService.getOrdersById(id);

        if (orders.length === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json(orders);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get orders"
        });
    }
}

export async function getOrdersByItemId(
    req: Request,
    res: Response
) {
    try {
        const itemId =
            String(req.params.itemId);

        const orders =
            await orderService
                .getOrdersByItemId(itemId);

        res.status(200).json(orders);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get Orders"
        });
    }
}

export async function getOrdersByUserId(
    req: Request,
    res: Response
) {
    try {
        const userId =
            String(req.params.userId);

        const orders =
            await orderService
                .getOrdersByUserId(userId);

        res.status(200).json(orders);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get Orders"
        });
    }
}

export async function generateOrderId(
    _req: Request,
    res: Response
) {
    try {
        const orderId = await orderService.generateOrderId();

        res.json({
            success: true,
            order_id: orderId
        });
    } catch (err) {
        res.status(500).json({
            success: false
        });
    }
}

export async function createOrder(
    req: Request,
    res: Response
) {
    try {

        const order =
            await orderService.createOrder(
                req.body
            );

        res.status(201).json(order);

    } catch (error) {

        console.error("CREATE Order ERROR:", error);

        res.status(500).json({
            message: "Failed to create Order",
            error: String(error)
        });
    }
}

export async function updateOrder(
    req: Request,
    res: Response
) {
    try {
        const id = String(req.params.id);

        const order =
            await orderService
                .updateOrder(id, req.body);

        res.status(200).json(order);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to update Order"
        });
    }
}

export async function deleteOrder(
    req: Request,
    res: Response
) {
    try {
        const id = String(req.params.id);

        await orderService
            .deleteOrder(id);

        res.status(200).json({
            message: "Order deleted"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete Order"
        });
    }
}

export async function getImpactData(
    _req: Request,
    res: Response) {
    try {
        const Impact =
            await orderService.getImpactData();
        res.status(200).json(Impact);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get Impact"
        });
    }
}