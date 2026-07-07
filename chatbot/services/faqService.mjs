import Fuse from "fuse.js";
import { getSheetData } from "../../backend/services/googleSheetService";
// import { FAQ } from "../../backend/models/FAQ";

let faqFuse = null;
let lastUpdate = 0;

const ONE_DAY = 24 * 60 * 60 * 1000;

const language ="en";

// ================= Get FAQ =================

export async function getFAQ(language = "th") {

    const data = await getSheetData("faqs");
    // console.log("FAQ RAW:", data);

     return data
        .filter(item => 
            item.language === language
        )
        .map(item => ({
            question: item.question,
            answer: item.answer,
            show_suggestion: item.show_suggestion
        }));

}

//==============suggestion=====================
export async function getSuggestions() {

    const faqs = await getFAQ(language);

    return faqs
        .filter(faq => faq.show_suggestion === "TRUE" || faq.show_suggestion === true)
        .map(faq => ({
            text: faq.question
        }));
}

// ================= Create FAQ Fuse =================
export async function createFAQFuse() {

    const now = Date.now();

    if (
        faqFuse &&
        now - lastUpdate < ONE_DAY
    ) {
        return faqFuse;
    }

    // console.log("โหลด FAQ จาก Google Sheet");

    const faqData = await getFAQ(language);

    const formattedFAQ = faqData.map(faq => ({
        ...faq,
        question: faq.question.split("|")
    }));


    return new Fuse(
        formattedFAQ,
        {
            keys: [
                {
                    name: "question",
                    weight: 1
                }
            ],
            threshold: 0.2,
            ignoreLocation: true,
            includeScore: true
        }
    );
}


// ----------------- ตัดคำน้า -------------------
function normalizeFAQQuestion(question) {
    return question
        .replace(/จ้า|จ๊ะ|จ๋า|ครับ|ค่ะ|คับ/g, "")
        .trim();
}

// ================= Search FAQ =================

export function searchFAQ(
    fuse,
    question
) {
    question = normalizeFAQQuestion(question);

    const result =
        fuse.search(question);


    if (result.length === 0) {

        return null;

    }


    return result[0].item.answer;

}