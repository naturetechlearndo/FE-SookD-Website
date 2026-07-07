import { useEffect, useRef, useState } from "react";
import "./ChatWidget.css";
import { getSessionId } from "../../utils/session";


export default function ChatWidget() {
    const token = localStorage.getItem("token");
    type ChatMessage = {
        sender: "user" | "bot";
        text: string;
        link?: string;
    };
    const [heroVisible, setHeroVisible] = useState(false);
    useEffect(() => {
        const hero = document.querySelector(".hero");

        if (!hero) {
            setHeroVisible(false);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                setHeroVisible(entry.isIntersecting);
            },
            {
                threshold: 0.2
            }
        );

        observer.observe(hero);

        return () => observer.disconnect();

    }, []);

    const language = "en";
    const TEXT = {
        th: {
            greeting: "สวัสดีจ้า มีอะไรให้ลุงช่วยไหมจ๊ะ 😊",
            busy: "ลุงยุ่งนิดหน่อย ลองถามใหม่อีกทีนะหลานๆ",
            name: "ลุงพาเที่ยว",
            contact: "ติดต่อทีมงาน",
            product: "ไปยังหน้าสินค้า",
            placeholder: "พิมพ์ข้อความ...",
            send: "ส่ง",
            takingYou: "ลุงกำลังพาไปนะ..."
        },
        en: {
            greeting: "Hi there! What can Uncle help you with today? 😊",
            busy: "Sorry, Uncle is a little busy right now. Please try asking again in a moment!",
            name: "Uncle Travel Guide",
            contact: "Contact Support",
            product: "View Product",
            placeholder: "Type a message...",
            send: "Send",
            takingYou: "Uncle is taking you there now..."
        }
    };


    const [isOpen, setIsOpen] = useState(false);
    const [showBubble, setShowBubble] = useState(true);
    const [bubbleLeaving, setBubbleLeaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const [showAdmin, setShowAdmin] = useState(false);
    const [adminMinimized, setAdminMinimized] = useState(false);
    const [adminAttention, setAdminAttention] = useState(false);
    const [showBuyLoading, setShowBuyLoading] = useState(false);

    type Suggestion = {
        text: string;
    };
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

    useEffect(() => {
        console.log("useEffect run");

        fetch("http://localhost:3000/chat/suggestions")
            .then(r => r.json())
            .then(data => {
                // console.log("suggestion", data);
                setSuggestions(data);
            })
            .catch(err => {
                console.error(err);
            });
    }, []);

    function triggerAdminButton() {
        setShowAdmin(true);
        setAdminAttention(true);

        // เด้ง (attention)
        setTimeout(() => {
            setAdminAttention(false);
        }, 2000);

        // ย่อเป็นไอคอน
        setTimeout(() => {
            setAdminMinimized(true);
        }, 8000);
    }

    function hideBubble() {

        setBubbleLeaving(true);

        setTimeout(() => {

            setShowBubble(false);

        }, 350); // เท่ากับ animation

    }

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([

        {

            sender: "bot",

            text: TEXT[language].greeting

        }

    ]);


    useEffect(() => {

        const timer = setTimeout(() => {
            hideBubble();
        }, 5000);


        return () => clearTimeout(timer);

    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth"
            });
        }, 50);

        return () => clearTimeout(timer);
    }, [messages, loading]);

    const handleContactAdmin = async () => {

        try {
            // เปิด LINE OA
            window.open("https://page.line.me/learndo?openQrModal=true");

        } catch (err) {

            console.error(err);

            alert("เกิดข้อผิดพลาด");

        }

    };

    async function sendMessage(customMessage?: string) {

        const userText = customMessage ?? message;

        if (!userText.trim()) return;

        // 1. add user message
        setMessages(prev => [
            ...prev,
            {
                sender: "user",
                text: userText
            }
        ]);

        setMessage("");
        setLoading(true);

        try {

            // console.log(localStorage.getItem("token"));
            const res = await fetch("http://localhost:3000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token ?? ""}`
                },
                body: JSON.stringify({
                    guestId: getSessionId(),
                    message: userText
                })
            });

            const data = await res.json();
            if (data.showAdmin) { triggerAdminButton(); }

            // 2. add bot response
            setMessages(prev => [
                ...prev,
                {
                    sender: "bot",
                    text: data.answer,
                    link: data.link
                }
            ]);

            // 3. handle link 
            if (data.link) {
                setShowBuyLoading(true);

                setTimeout(() => {
                    setShowBuyLoading(false);
                    console.log("dataLink:",data.link);
                    window.open(data.link, "_blank");
                }, 3000);
            }

        } catch (err) {

            setMessages(prev => [
                ...prev,
                {
                    sender: "bot",
                    text: TEXT[language].busy
                }
            ]);

        } finally {
            setLoading(false);
        }
    }
    return (
        <>

            {/* Bubble */}
            {showBubble && (
                <div
                    className={`auto-message
            ${bubbleLeaving ? "hide" : "show"}
            ${heroVisible ? "auto-message--heroPart" : ""}
        `}
                >
                    {TEXT[language].greeting}
                </div>
            )}

            {/* Contact Admin */}

            {showAdmin && (
                <button
                    className={`admin-btn
      ${adminAttention ? "attention" : ""}
      ${adminMinimized ? "small" : ""}
      ${heroVisible ? "heroPart" : ""}
    `}
                    onClick={handleContactAdmin}
                >

                    {adminMinimized ? "💬" : `💬 ${TEXT[language].contact}`}
                </button>
            )}

            {/* Floating Button */}

            <button
                className={`chat-btn ${heroVisible ? "chat-btn--heroPart" : ""
                    }`}
                onClick={() => {

                    setIsOpen(!isOpen);

                    // setShowBubble(false);
                    hideBubble();

                }}
            >

                <img
                    src={
                        heroVisible
                            ? "../../../img/uncle.png"
                            : "../../../img/uncleMini.png"
                    }
                    alt="chat"
                />

            </button>

            {/* Chat Box */}

            <div
                className={`chat-box ${isOpen ? "" : "hidden"}`}
            >

                <div className="chat-header">

                    <span>

                        {TEXT[language].name}

                    </span>

                    <button
                        className="close-chat"
                        onClick={() => setIsOpen(false)}
                    >
                        ✕
                    </button>

                </div>

                <div className="messages">

                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={
                                msg.sender === "user"
                                    ? "user-message"
                                    : "bot-message"
                            }
                        >
                            <div>{msg.text}</div>

                            {msg.link && (
                                <div className="suggestion-chip">
                                <a
                                    href={msg.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="buy-link"
                                >
                                    🛒 {TEXT[language].product}
                                </a>
                                </div>
                            )}
                        </div>
                    ))}


                    {loading && (
                        <div className="bot-message typing">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                        </div>
                    )}


                    {/* บังคับ scroll */}
                    <div ref={messagesEndRef} />

                </div>
                {/* =============================== */}
                {/* {messages.length === 0 && ( */}
                <div className="chat-suggestions">
                    {suggestions.map((item) => (
                        <button
                            key={item.text}
                            className="suggestion-chip"
                            onClick={() => sendMessage(item.text)}
                        >
                            {item.text}
                        </button>
                    ))}
                </div>
                {/* )} */}

                <div className="chat-input"></div>
                {/* =============================== */}

                <div className="chat-input">

                    <input

                        value={message}

                        placeholder={TEXT[language].placeholder}

                        onChange={(e) =>
                            setMessage(e.target.value)
                        }

                        onKeyDown={(e) => {

                            if (e.key === "Enter") {

                                sendMessage();

                            }

                        }}

                    />

                    <button className="send"
                        onClick={sendMessage}
                    >
                        {TEXT[language].send}

                    </button>
                </div>

            </div>


            {showBuyLoading && (
                <div className="buy-overlay">
                    <div className="buy-box">
                        <div className="spinner"></div>
                        <div>{TEXT[language].takingYou}</div>
                    </div>
                </div>
            )}

        </>

    );

}