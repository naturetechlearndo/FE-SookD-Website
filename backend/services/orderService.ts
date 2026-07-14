import { Order } from "../models/Order";
import { generateNextId } from "../utils/idGenerator";
import { getSheetData, clearSheetCache } from "./googleSheetService";

export async function getOrders()
    : Promise<Order[]> {
    const data = await getSheetData("orders");
    return data.map((item: any) => ({
        order_id: item.order_id,
        user_id: item.user_id,
        order_date: item.order_date,
        item_id: item.item_id,
        quantity: item.quantity,
        total_price: item.total_price,
        order_status: item.order_status,
        shipping_address: item.shipping_address,
        order_select_date: item.order_select_date,
        applied_promotion_id: item.applied_promotion_id
    }));
}

// export async function getOrderById(
//     id: string
// ): Promise<Order | undefined> {

//     const orders = await getOrders();

//     console.log("Search:", id);
//     console.log("Total:", orders.length);

//     const order = orders.find(o => o.order_id === id);

//     console.log("Found:", order);

//     return order;
// }

export async function getOrderById(id: string): Promise<Order | undefined> {
    const response = await fetch(process.env.GAS_URL!, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            action: "getOrderById",
            order_id: id
        })
    });

    // console.log("status", response.status);

    const text = await response.text();

    // console.log("text =", text);

    const result = JSON.parse(text);
    return result.order;
}

export async function getOrdersById(id: string) {
    // const orders = await getOrders();
    // return orders.filter(o => o.order_id === id);

    console.log("id", id);
    const response = await fetch(process.env.GAS_URL!, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            action: "getOrdersById",
            order_id: id
        })
    });

    // console.log("status", response.status);

    const text = await response.text();

    console.log("text =", text);

    const result = JSON.parse(text);

    return result.orders;

}

export async function generateOrderId(): Promise<string> {
    const orders = await getOrders();

    return generateNextId(
        orders.map(o => o.order_id),
        "ORD"
    );
}

export async function createOrder(
    orderData: Order
): Promise<Order> {

    // const orders = await getOrders();

    const newOrder: Order = {
        ...orderData
    };

    const response = await fetch(process.env.GAS_URL!, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            action: "createOrder",
            data: newOrder
        })
    });

    const result = await response.json();
    console.log(result);

    if (!result.success) {
        throw new Error("Create order failed");
    }

    clearSheetCache("orders");

    return newOrder;
}

// delete //
export async function deleteOrder(
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
                action: "deleteOrder",
                order_id: id
            })
        }
    );

    const result = await response.json();

    return result.success;
}

// update //
export async function updateOrder(
    id: string,
    order: Partial<Order>
): Promise<Order> {


    const cleanOrder = Object.fromEntries(
        Object.entries(order).filter(([_, v]) => v !== undefined)
    );
    const response = await fetch(
        process.env.GAS_URL!,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "updateOrder",
                order_id: id,
                data: cleanOrder
            })
        }
    );

    const result = await response.json();

    if (!result.success) {
        console.log(result);
        throw new Error("Update failed");
    }

    return result.order;
}

export async function getOrdersByItemId(
    itemId: string
): Promise<Order[]> {

    const orders = await getOrders();

    return orders.filter(
        order => order.item_id === itemId
    );
}

export async function getOrdersByUserId(
    userId: string
): Promise<Order[]> {

    const orders = await getOrders();

    return orders.filter(
        order => order.user_id === userId
    );
}

//===========================//
export async function getImpactData() {

    const orders = await getOrders();

    const completedOrders = orders.filter(
        o => o.order_status === "completed"
    );

    // console.log(completedOrders);

    const sum_profits = completedOrders.reduce(
        (sum, order) => sum + Number(order.total_price),
        0
    );

    const job_count = Math.floor((sum_profits * 0.1) / 1000);

    // console.log(job_count);

    return {
        job_count,
        sum_profits
    };
}