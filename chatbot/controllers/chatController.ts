// import { createFuse } from "./services/searchService.mjs";
import { request, Response } from "express";
import { askGemini, buildPrompt } from "../services/geminiService.mjs";
import { getSession, sessionSet, updateHistory, checkRateLimit, updateQuestionCount } from "../services/sessionService.mjs";
import { getIntent, buildContext, createFuse } from "../services/intentSearchContextService.mjs";

import { getSessionId } from "../../src/utils/session";

import { normalizeQuestion, adjustScore } from "../utils/normalizeQuestion.mjs";
import { getSearchData } from "../services/searchDataService.mjs";

import { createFAQFuse, getFAQ, getSuggestions, searchFAQ } from "../services/faqService.mjs";
import { AuthRequest } from "../../backend/middlewares/authMiddleware";
import { createAdminChat } from "../services/adminService";

const {
    productSearchData,
    activitySearchData
} = await getSearchData();

const productTH = productSearchData.filter(item =>
    item.raw.id.endsWith("_TH")
);

const productEN = productSearchData.filter(item =>
    item.raw.id.endsWith("_EN")
);

const activityTH = activitySearchData.filter(item =>
    item.raw.id.endsWith("_TH")
);

const activityEN = activitySearchData.filter(item =>
    item.raw.id.endsWith("_EN")
);

const productFuseTH = createFuse(productTH);
const productFuseEN = createFuse(productEN);

const activityFuseTH = createFuse(activityTH);
const activityFuseEN = createFuse(activityEN);

const allFuseTH = createFuse([
    ...productTH,
    ...activityTH
]);

const allFuseEN = createFuse([
    ...productEN,
    ...activityEN
]);

export async function chatController(
    req: AuthRequest,
    res: Response
) {

    const sessionId = req.user?.user_id || req.body.guestId;
    const session = getSession(sessionId);

    const count = updateQuestionCount(sessionId);
    const language = req.body.language === "en" ? "en" : "th";

    const productFuse = language === "en" ? productFuseEN : productFuseTH;

    const activityFuse = language === "en" ? activityFuseEN : activityFuseTH;

    const allFuse = language === "en" ? allFuseEN : allFuseTH;

    //=============== check limit ========//
    if (!checkRateLimit(sessionId)) {

        return res.status(429).json({
            answer:
                language === "en"
                    ? "Uncle needs a short break. Please come back and ask again later!"
                    : "ลุงขอพักซักหน่อย ไว้มาถามลุงใหม่นะ",
            error: true,
            showAdmin: session.questionCount >= 5
        });

    }
    // ---------------------------------------------

    try {

        const {
            question,
            cleanQuestion
        } = normalizeQuestion(
            req.body.message
        );


        //========Intent================//

        const intent = getIntent(question, "en");


        let fuse;

        switch (intent) {

            case "product":

                fuse = productFuse;
                break;


            case "activity":

                fuse = activityFuse;
                break;


            default:

                fuse = allFuse;
        }

        if (
            intent === "price" &&
            session.lastResults
        ) {

            const item = session.lastResults.raw;

            const answer =
                language === "en"
                    ? `${item.name} costs ${item.price} THB.\nYou can find it here: ${item.link}`
                    : `${item.name} ราคา ${item.price} บาทจ้า\nลิงก์นี้เลยนะ ${item.link}`;

            updateHistory(
                sessionId,
                question,
                answer
            );

            return res.json({
                answer,
                showAdmin: session.questionCount >= 5
            });
        }

        if (
            intent === "buy" &&
            session.lastResults
        ) {

            const link = session.lastResults.raw.link?.trim();


            const place = session.lastResults.raw.origin;
            let answer;

            if (place) {

                answer =
                    language === "en"
                        ? `You can get it at "${place}".`
                        : `ซื้อได้ที่ "${place}" นะจ๊ะ`;

            } else {

                answer =
                    language === "en"
                        ? "Uncle will check with the admin and get back to you."
                        : "ลุงขอสอบถามแอดมินก่อนนะจ๊ะ";

            }

            updateHistory(
                sessionId,
                question,
                answer
            );
            console.log("buy");
            console.log("link", session.lastResults.raw.link);
            console.log("raw", session.lastResults.raw);

            return res.json({
                answer,
                link:
                    session.lastResults.raw
                        .link,
                showAdmin: session.questionCount >= 5
            });
        }


        //=========FAQ=========//
        console.log("lang",language);
        const faqFuse = await createFAQFuse(language);

        const faqAnswer =
            searchFAQ(
                faqFuse,
                question
            );

        if (faqAnswer) {

            updateHistory(
                sessionId,
                question,
                faqAnswer
            );

            return res.json({
                answer: faqAnswer,
                showAdmin: session.questionCount >= 5
            });

        }

        //============Search====================///

        let result = fuse.search(question);

        if (result.length === 0) {
            result = fuse.search(cleanQuestion);
        } if (result.length === 0) {
            result = session.lastSearchResults;
        }

        session.lastSearchResults = result;



        //==============Ranking==============//

        result =
            adjustScore(
                result,
                question
            );
        console.log("result", result);

        //================ Context ==============//

        const context = buildContext(result, "en");

        //============== History =============//

        const historyText =
            session.history
                .map(
                    (chat: {
                        question: string;
                        answer: string;
                    }) =>
                        `ผู้ใช้: ${chat.question} ลุง: ${chat.answer}`
                );

        const prompt =
            buildPrompt(
                context,
                historyText,
                question,
                language
            );

        //=============== Gemini ============//

        let answer = await askGemini(prompt);

        let ai: {
            selected: number;
            answer: string;
        };

        try {

            ai = JSON.parse(answer);

        } catch {

            return res.json({
                answer:
                    language === "en"
                        ? "Sorry, Uncle couldn't understand the question, please try again"
                        : "ลุงไม่เข้าใจคำถามเท่าไหร่ ถามลุงใหม่อีกครั้งนะ",
                showAdmin: session.questionCount >= 5
            });
        }

        const selected = result[ai.selected - 1];

        updateHistory(
            sessionId,
            question,
            answer
        );

        //==============Session Set==========//

        sessionSet(sessionId, selected.item);

        console.log("session keep:", getSession(sessionId).lastResults);

        return res.json({
            answer: ai.answer,
            link: selected?.item?.raw?.link,
            showAdmin: session.questionCount >= 5
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            answer:
                language === "en"
                    ? "Uncle is a little busy right now. Could you please ask again in a moment?"
                    : "ลุงยุ่งนิดหน่อย ลองถามใหม่อีกทีนะหลานๆ",
            error: true,
            showAdmin: session.questionCount >= 5
        });
    }

}


export async function getSuggestionController(
    req: AuthRequest,
    res: Response
) {
    const language =  req.query.language === "en" ? "en" : "th";
    try {
        const suggestions = await getSuggestions(language);

        res.json(suggestions);
    }
    catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false
        });
    }

}


export async function contactAdmin(
    req: AuthRequest,
    res: Response
) {
    try {
        const sessionId = req.user?.user_id || req.body.guestId;

        const session = getSession(sessionId);
        console.log("USER", req.user);
        console.log("session", session);
        const history = session.history
            .map(chat =>
                `👤 ลูกค้า: ${chat.question}\n🤖 ลุง: ${chat.answer}`
            )
            .join("\n\n");

        const adminChat = await createAdminChat({
            session_id: sessionId,
            history,
            status: "waiting",
            created_at: new Date().toISOString()
        });

        return res.json({
            success: true,
            reference: adminChat.reference_id
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false
        });
    }
}