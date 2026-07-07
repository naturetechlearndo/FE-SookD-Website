import Fuse from "fuse.js";
// const language = req.body.language || "th";

//====================Intent type of question==============================//
export function getIntent(
    question,
    language = "th"
) {

    const q = question.toLowerCase();

    if (language === "en") {

        if (/souvenir|product|food|drink|organic/.test(q))
            return "product";

        if (/activity|workshop|camp|experience|things to do/.test(q))
            return "activity";

        if (/travel|place|community|where|nature|destination/.test(q))
            return "place";

        if (/recommend|suggest|interesting/.test(q))
            return "recommend";

        if (/buy|purchase|order|link|cart/.test(q))
            return "buy";

        if (/price|cost|fee/.test(q))
            return "price";

        return "chat";
    }

    // -------- TH --------

    if (/ของฝาก|สินค้า|กิน|ดื่ม|อาหาร/.test(question))
        return "product";

    if (/กิจกรรม|เวิร์กช็อป|workshop|ทำอะไร/.test(question))
        return "activity";

    if (/เที่ยว|สถานที่|ชุมชน|ไปไหนดี|ธรรมชาติ/.test(question))
        return "place";

    if (/แนะนำ|มีอะไรบ้าง|น่าสนใจ/.test(question))
        return "recommend";

    if (/ซื้อ|ลิงก์|ลิ้งก์|link|สั่งซื้อ|สั่ง|กดตะกร้า|เอาสินค้านี้|ไปเลย|เอาอันนี้|จัด|เอา/.test(question))
        return "buy";

    if (/ราคา/.test(question))
        return "price";

    return "chat";
}

export function getType(question) {

    if (/เหล้า|สุรา/.test(question))
        return "alcohol";

    if (/หิว|กิน/.test(question))
        return "eatable";

    if (/เที่ยว/.test(question))
        return "travel";

    return "etc";
}

//==============searchService=========//
export function createFuse(searchData) {

    return new Fuse(searchData, {

        keys: [

            {
                name: "name",
                weight: 0.8
            },

            {
                name: "detail",
                weight: 0.2
            }

        ],

        threshold: 0.7,

        includeScore: true,

        ignoreLocation: true
    });

}

//==============EDIT CONTEXT===============//
export function buildContext(
    result,
    language = "th"
) {

    return result
        .slice(0, 3)
        .map(r => {

            const item = r.item;
            const data = item.raw;

            switch (item.type) {

                case "product":

                    if (language === "en") {

                        return `
Product: ${data.name ?? "-"}
Category: ${data.type ?? "-"}
Description: ${data.detail ?? "-"}
Highlight: ${data.highlight ?? "-"}
Suitable for: ${data.target ?? "-"}
Price: ${data.price ?? "-"}`;
// Link: ${data.link ?? "-"}`;

                    }

                    return `
สินค้า: ${data.name ?? "-"}
ประเภท: ${data.type ?? "-"}
ข้อมูล: ${data.detail ?? "-"}
จุดเด่น: ${data.highlight ?? "-"}
เหมาะกับ: ${data.target ?? "-"}
ราคา: ${data.price ?? "-"}`;
// ลิงก์: ${data.link ?? "-"}`;

                case "activity":

                    if (language === "en") {

                        return `
Activity: ${data.name ?? "-"}
Activity Type: ${data.type ?? "-"}
Description: ${data.description ?? "-"}
Location: ${data.location ?? "-"}
Meeting Point: ${data.meetingPoint ?? "-"}
Price: ${data.price ?? "-"}
`;

                    }

                    return `
กิจกรรม: ${data.name ?? "-"}
ประเภทกิจกรรม: ${data.type ?? "-"}
รายละเอียด: ${data.description ?? "-"}
สถานที่: ${data.location ?? "-"}
จุดนัดพบ: ${data.meetingPoint ?? "-"}
ราคา: ${data.price ?? "-"}
`;

                case "place":

                    if (language === "en") {

                        return `
Place: ${data.name ?? "-"}
// Origin: ${data.origin ?? "-"}`;
// Link: ${data.link ?? "-"}`;

                    }

                    return `
สถานที่: ${data.name ?? "-"}
ที่มาสถานที่: ${data.origin ?? "-"}`;
// ลิงก์: ${data.link ?? "-"}`;

                default:
                    return "";

            }

        })
        .join("\n\n");

}