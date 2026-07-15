import { Request, Response } from "express";
import { createPaymentLineUrl, getLineImage, pushMessage, pushOrderToGroup, pushSlipToGroup, replyFirstMessage, replyMessage } from "../services/lineService";
import * as orderService from "../services/orderService"
import { saveSlip } from "../services/fileService";

const waitingSlip: Record<string, string> = {};
const orderLineUsers: Record<string, string> = {};

export async function webhook(
    req: Request,
    res: Response
) {

    // console.log(JSON.stringify(req.body, null, 2));
    const events = req.body.events;

    if (!events) {
        // console.log("here");
        return res.sendStatus(200);
    }

    for (const event of events) {

        // ปุ่มจาก Flex Message
        if (event.type === "postback") {

            const data = event.postback.data;

            const params = new URLSearchParams(data);

            const action = params.get("action");
            const orderId = params.get("order_id");


            if (action === "upload_slip" && orderId) {

                await replyMessage(
                    event.replyToken,
                    "แนบรูปสลิปได้เลยครับ"
                );

                // ตอนกดปุ่ม
                waitingSlip[event.source.userId] = orderId;
                orderLineUsers[orderId] = event.source.userId;

            }

            if (action === "check_payment" && orderId) {

                await orderService.updateOrder(
                    orderId,
                    {
                        order_status: "completed"
                    }
                );


                await replyMessage(
                    event.replyToken,
                    `✅ ยืนยัน Order ${orderId} เรียบร้อย`
                );


                const customer =
                    orderLineUsers[orderId];


                if (customer) {

                    await pushMessage(
                        customer,
                        `✅ การชำระเงิน Order ${orderId} ได้รับการยืนยันแล้วครับ`
                    );

                } else {

                    console.log(
                        "ไม่พบ line user ของ order:",
                        orderId
                    );

                }
            }


            continue;
        }


        // ข้อความ
        if (event.type === "message") {


            if (event.message.type === "text") {

                const text = event.message.text;

                const match = text.match(/Order ID:\s*(ORD\d+)/i);

                if (!match) continue;


                const orderId = match[1];


                const orders =
                    await orderService.getOrdersById(orderId);


                const total = orders.reduce(
                    (sum, o) => sum + Number(o.total_price),
                    0
                );


                await replyFirstMessage(
                    event.replyToken,
                    orderId,
                    total
                );


                await pushOrderToGroup(
                    orderId,
                    `ยอดรวม ${total} บาท`
                );
            }


            // รับรูปสลิป
            if (event.message.type === "image") {

                const orderId = waitingSlip[event.source.userId];

                // const order =await orderService.getOrderByLineUserId(lineUserId);


                if (!orderId) {
                    await replyMessage(
                        event.replyToken,
                        "ไม่พบรายการสั่งซื้อ กรุณากดปุ่มแนบสลีปก่อนครับ"
                    );
                    continue;
                }
                // const orderId = "ORD000";

                const messageId = event.message.id;

                const imageBuffer = await getLineImage(messageId);

                const imagePath = saveSlip(imageBuffer, orderId);
                const slipUrl = `${process.env.BASE_URL}${imagePath}`;


                await pushSlipToGroup(
                    orderId,
                    "ลูกค้าส่งสลิปมาแล้ว",
                    slipUrl
                );
            }
        }

    }

    res.sendStatus(200);
}


export async function paymentLine(
    req: Request,
    res: Response
) {
    try {

        const { order_id } = req.body;

        const result =
            await createPaymentLineUrl(order_id);

        res.json(result);

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Cannot create line url"
        });

    }
}

