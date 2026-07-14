import { getOrdersById } from "./orderService";
export async function replyMessage(replyToken: string, text: string) {
    await fetch("https://api.line.me/v2/bot/message/reply", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
            replyToken,
            messages: [
                {
                    type: "text",
                    text,
                },
            ],
        }),
    });
}

export async function replyFirstMessage(replyToken: string, orderId: string, total: number) {
    await fetch("https://api.line.me/v2/bot/message/reply", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
            replyToken,
            messages: [
                {
                    type: "flex",
                    altText: "แจ้งการชำระเงิน",
                    contents: {
                        type: "bubble",

                        body: {
                            type: "box",
                            layout: "vertical",
                            contents: [
                                {
                                    type: "text",
                                    text: `🧾 Order ${orderId}`
                                },
                                {
                                    type: "text",
                                    text: `ยอดรวม ${total} บาท`
                                },
                                {
                                    type: "text",
                                    text: `ชำระได้ผ่าน`
                                },
                                {
                                    type: "text",
                                    text: "ธนาคาร กรุงแตก"
                                },
                                {
                                    type: "text",
                                    text: "ชื่อบัญชี SOOD.ltd"
                                },
                                {
                                    type: "text",
                                    text: "เลขบัญชี 123-456-789"
                                },
                                {
                                    type: "text",
                                    text: "กดปุ่มด้านล่างเพื่อส่งสลิปครับ"
                                }
                            ]
                        },

                        footer: {
                            type: "box",
                            layout: "vertical",
                            contents: [
                                {
                                    type: "button",
                                    action: {
                                        type: "postback",
                                        label: "📎 ส่งสลิป",
                                        data: `action=upload_slip&order_id=${orderId}`
                                    }
                                }
                            ]
                        }
                    }
                }
            ]
        }),
    });
}


export async function createPaymentLineUrl(orderId: string) {

    const orders = await getOrdersById(orderId);

    console.log("control",orders);
    if (orders.length === 0) {
        throw new Error("Order not found");
    }

    const total = orders.reduce(
        (sum, item) => sum + Number(item.total_price),
        0
    );

    let message =
        `ต้องการแจ้งชำระเงิน

Order ID: ${orderId}
`;
    for (const order of orders) {

        message +=
            `สินค้า: ${order.item_id}
จำนวน: ${order.quantity}
ราคา: ${order.total_price} บาท

`;

    }

    message += `ยอดรวม ${total} บาท`;

    const lineUrl =
        "https://line.me/R/oaMessage/" +
        process.env.LINE_OA_ID +
        "/?" +
        encodeURIComponent(message);

    return lineUrl;
}

export async function pushOrderToGroup(orderId: string, text: string) {

    await fetch(
        "https://api.line.me/v2/bot/message/push",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
                to: process.env.LINE_GROUP_ID,
                messages: [
                    {
                        type: "flex",
                        altText: "มีรายการสั่งซื้อใหม่",
                        contents: {
                            type: "bubble",
                            body: {
                                type: "box",
                                layout: "vertical",
                                contents: [
                                    {
                                        type: "text",
                                        text: "📢 มีรายการใหม่",
                                        weight: "bold",
                                        size: "lg"
                                    },
                                    {
                                        type: "text",
                                        text: `Order: ${orderId}`
                                    },
                                    {
                                        type: "text",
                                        text
                                    }
                                ]
                            }
                        }
                    }
                ]
            })
        }
    );
}


export async function pushSlipToGroup(
    orderId: string,
    text: string,
    slipUrl: string
) {

    await fetch(
        "https://api.line.me/v2/bot/message/push",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
                to: process.env.LINE_GROUP_ID,
                messages: [
                    {
                        type: "image",
                        originalContentUrl: slipUrl,
                        previewImageUrl: slipUrl
                    }, {
                        type: "flex",
                        altText: "ตรวจสอบการชำระเงิน",
                        contents: {

                            type: "bubble",

                            hero: {
                                type: "image",
                                url: slipUrl,
                                size: "full",
                                aspectRatio: "20:13",
                                aspectMode: "cover"
                            },

                            body: {
                                type: "box",
                                layout: "vertical",
                                contents: [
                                    {
                                        type: "text",
                                        text: "📢 ตรวจสอบการชำระเงิน",
                                        weight: "bold",
                                        size: "lg"
                                    },
                                    {
                                        type: "text",
                                        text: `Order: ${orderId}`,
                                        margin: "md"
                                    },
                                    {
                                        type: "text",
                                        text
                                    }
                                ]
                            },

                            footer: {
                                type: "box",
                                layout: "vertical",
                                contents: [
                                    {
                                        type: "button",
                                        style: "primary",
                                        action: {
                                            type: "postback",
                                            label: "การชำระเงินถูกต้อง",
                                            data:
                                                `action=check_payment&order_id=${orderId}`
                                        }
                                    }
                                ]
                            }
                        }
                    }
                ]
            })
        }
    );
}

export async function getLineImage(
    messageId: string
) {

    const response = await fetch(
        `https://api-data.line.me/v2/bot/message/${messageId}/content`,
        {
            headers: {
                Authorization:
                    `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
            }
        }
    );


    if (!response.ok) {
        throw new Error(
            "Cannot download LINE image"
        );
    }


    const buffer =
        await response.arrayBuffer();


    return Buffer.from(buffer);
}


export async function pushMessage(
    userId: string,
    text: string
) {

    await fetch(
        "https://api.line.me/v2/bot/message/push",
        {
            method:"POST",

            headers:{
                "Content-Type":"application/json",
                Authorization:
                `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
            },

            body:JSON.stringify({

                to:userId,

                messages:[
                    {
                        type:"text",
                        text
                    }
                ]
            })
        }
    );
}