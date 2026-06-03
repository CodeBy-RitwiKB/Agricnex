"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, AlertCircle, HelpCircle, ShieldCheck, Cpu, Languages, X } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "🌱 What are the highest-yielding vegetable seeds?",
  "🧪 Recommend organic fertilizers for my tomato crop.",
  "🌾 Explain government yojanas (schemes) active today.",
  "🚜 What machinery tools are recommended for tilling?"
];

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
];

const WELCOME_MESSAGES: Record<string, string> = {
  "English": "Welcome to the **Agrinex AI Assistant**! 🌾\n\nI can help you search the store inventory, provide expert farming advice, recommend seeds/fertilizers, and fetch active government schemes. Ask me anything below!",
  "Hindi": "आपका **एग्रीनेक्स एआई सहायक** में स्वागत है! 🌾\n\nमैं आपको स्टोर इन्वेंट्री खोजने, विशेषज्ञ कृषि सलाह देने, बीज/उर्वरक की सिफारिश करने और सक्रिय सरकारी योजनाओं को प्राप्त करने में मदद कर सकता हूं। नीचे मुझसे कुछ भी पूछें!",
  "Marathi": "तुमचे **ऍग्रीनेक्स एआय सहाय्यक** मध्ये स्वागत आहे! 🌾\n\nमी तुम्हाला स्टोअर इन्व्हेंटरी शोधण्यात, तज्ज्ञ शेती सल्ला देण्यास, बियाणे/खतांची शिफारस करण्यास आणि सक्रिय सरकारी योजना मिळविण्यात मदत करू शकतो. खाली मला काहीही विचारा!",
  "Punjabi": "**ਐਗਰੀਨੇਕਸ ਏਆਈ ਸਹਾਇਕ** ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ! 🌾\n\nਮੈਂ ਸਟੋਰ ਇਨਵੈਂਟਰੀ ਖੋਜਣ, ਮਾਹਰ ਖੇਤੀਬਾੜੀ ਸਲਾਹ ਦੇਣ, ਬੀਜਾਂ/ਖਾਦਾਂ ਦੀ ਸਿਫਾਰਸ਼ ਕਰਨ ਅਤੇ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਨੂੰ ਲੱਭਣ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਹੇਠਾਂ ਮੈਨੂੰ ਕੁझ ਵੀ ਪੁੱਛੋ!",
  "Telugu": "నమస్తే! **అగ్రినెక్స్ AI అసిస్టెంట్** కి స్వాగతం! 🌾\n\nనేను మీకు స్టోర్ ఇన్వెంటరీని శోధించడంలో, నిపుణుల వ్యవసాయ సలహాలను అందించడంలో, విత్తనాలు/ఎరువులను సిఫార్సు చేయడంలో మరియు క్రియాశీల ప్రభుత్వ పథకాలను పొందడంలో సహాయపడగలను. కింద నన్ను ఏదైనా అడగండి!",
  "Tamil": "**அக்ரிநெக்ஸ் AI உதவியாளருக்கு** உங்களை வரவேற்கிறோம்! 🌾\n\nஸ்டோர் தயாரிப்புகளை தேடவும், பயிர் ஆலோசனைகளை வழங்கவும், விதைகள்/உரங்களை பரிந்துரைக்கவும் மற்றும் அரசு திட்டங்களை பெறவும் நான் உங்களுக்கு உதவ முடியும். கீழே என்னிடம் எதையும் கேளுங்கள்!",
  "Kannada": "**ಅಗ್ರಿನೆಕ್ಸ್ AI ಸಹಾಯಕಕ್ಕೆ** ಸುಸ್ವಾಗತ! 🌾\n\nನಾನು ನಿಮಗೆ ಅಂಗಡಿ ದಾಸ್ತಾನು ಹುಡುಕಲು, ತಜ್ಞ ಕೃಷಿ ಸಲಹೆಗಳನ್ನು ನೀಡಲು, ಬೀಜಗಳು/ರಸಗೊಬ್ಬರಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡಲು ಮತ್ತು ಸಕ್ರಿಯ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಪಡೆಯಲು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ಕೆಳಗೆ ನನ್ನನ್ನು ಏನನ್ನಾದರೂ ಕೇಳಿ!"
};

const BlinkingBotIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={`${className}`}
  >
    <defs>
      <radialGradient id="screenGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </radialGradient>
      
      <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
    </defs>

    <style>{`
      @keyframes eye-blink {
        0%, 90%, 100% { transform: scaleY(1); }
        93%, 97% { transform: scaleY(0.15); }
      }
      .bot-eye-l {
        animation: eye-blink 4s infinite;
        transform-origin: 36px 36px;
      }
      .bot-eye-r {
        animation: eye-blink 4s infinite;
        transform-origin: 64px 36px;
      }
    `}</style>

    {/* Body Elements */}
    {/* Neck */}
    <rect x="44" y="50" width="12" height="12" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
    
    {/* Left Arm (Resting) - Shaded outwards */}
    <path d="M 24 60 Q 14 70 18 90 Q 24 94 28 88 Q 28 72 26 60 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
    
    {/* Right Arm (Waving HIGH to say "hi") - Points outwards/upwards */}
    <g>
      <path d="M 72 58 Q 88 44 92 48 Q 94 52 88 58 Q 74 62 72 58 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 72 58; 15 72 58; -15 72 58; 0 72 58"
        dur="1.2s"
        repeatCount="indefinite"
      />
    </g>

    {/* Chest - Lengthened to y=90 */}
    <path d="M 28 58 C 28 50, 72 50, 72 58 C 72 90, 28 90, 28 58 Z" fill="url(#bodyGrad)" stroke="#cbd5e1" strokeWidth="2" />
    <path d="M 36 76 Q 50 82 64 76" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
    
    {/* Glowing Blue Core Button on Chest (matching new mockup) */}
    <circle cx="50" cy="70" r="7" fill="#38bdf8" stroke="#cbd5e1" strokeWidth="1.5" className="animate-pulse" />
    <circle cx="50" cy="70" r="3" fill="#ffffff" />

    {/* Ears */}
    <rect x="7" y="24" width="8" height="16" rx="4" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
    <rect x="85" y="24" width="8" height="16" rx="4" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />

    {/* Helmet */}
    <rect x="13" y="10" width="74" height="44" rx="20" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2.5" />
    
    {/* Screen */}
    <rect x="19" y="15" width="62" height="34" rx="14" fill="url(#screenGrad)" />

    {/* Capsule-shaped Glowing Eyes (matching user's uploaded mockup) */}
    <rect
      x="32"
      y="29"
      width="8"
      height="14"
      rx="4"
      className="bot-eye-l"
      fill="#38bdf8"
    />
    <rect
      x="60"
      y="29"
      width="8"
      height="14"
      rx="4"
      className="bot-eye-r"
      fill="#38bdf8"
    />

    {/* Smiling Mouth */}
    <path d="M 44 40 Q 50 48 56 40 Z" fill="#38bdf8" />
  </svg>
);

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [language, setLanguage] = useState("English");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: WELCOME_MESSAGES["English"],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleLanguageChange = (selectedLang: string) => {
    setLanguage(selectedLang);
    setIsLangMenuOpen(false);
    
    // Only update first message if it's the welcome message
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [{ role: "assistant", content: WELCOME_MESSAGES[selectedLang] || WELCOME_MESSAGES["English"] }];
      }
      return prev;
    });
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage = textToSend.trim();
    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
          language: language,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to get response from assistant.");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err.message || "Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Simple, high-fidelity markdown parser for links, bold, headings, dividers, and bullet lists
  const renderMessageContent = (text: string) => {
    const escapeHtml = (str: string) => {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
      let cleanLine = line.trim();
      if (!cleanLine) return <div key={lineIdx} className="h-2" />;

      // 1. Check for Horizontal Rule
      if (/^---+$/.test(cleanLine)) {
        return <hr key={lineIdx} className="my-3 border-zinc-200 dark:border-zinc-800" />;
      }

      // 2. Check for Headings
      const headingMatch = cleanLine.match(/^(#{1,6})\s+(.*)$/);
      let isHeading = false;
      let depth = 0;
      if (headingMatch) {
        isHeading = true;
        depth = headingMatch[1].length;
        cleanLine = headingMatch[2];
      }

      // 3. Check for List Item
      let isList = false;
      if (cleanLine.startsWith("* ") || cleanLine.startsWith("- ")) {
        isList = true;
        cleanLine = cleanLine.substring(2).trim();
      }

      // Escape HTML first to be safe
      let html = escapeHtml(cleanLine);

      // Parse bold **text**
      html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

      // Parse italic *text*
      html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

      // Parse links [text](url) into actual clickable anchors
      html = html.replace(/\[(.*?)\]\((.*?)\)/g, (match, linkText, linkUrl) => {
        return `<a href="${linkUrl}" class="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/30 inline-flex items-center gap-0.5 transition-all">${linkText}</a>`;
      });

      const contentNode = <span dangerouslySetInnerHTML={{ __html: html }} />;

      if (isHeading) {
        if (depth === 1) return <h1 key={lineIdx} className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-3 mb-1.5">{contentNode}</h1>;
        if (depth === 2) return <h2 key={lineIdx} className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-3 mb-1.5">{contentNode}</h2>;
        return <h3 key={lineIdx} className="text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-3 mb-1.5">{contentNode}</h3>;
      }

      if (isList) {
        return (
          <li key={lineIdx} className="ml-5 list-disc mb-1.5 text-[15px] leading-relaxed">
            {contentNode}
          </li>
        );
      }

      return (
        <p key={lineIdx} className="mb-3 text-[15px] leading-relaxed break-words">
          {contentNode}
        </p>
      );
    });
  };

  return (
    <main className="min-h-screen flex flex-col bg-[var(--background)]">
      <Header />

      <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)] min-h-[600px]">
        {/* Sidebar Info */}
        <div className="w-full md:w-80 shrink-0 flex flex-col gap-4">
          <div className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
                <h2 className="text-lg font-black text-[var(--foreground)] uppercase tracking-wide">AgriBot RAG System</h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Our hybrid retrieval-augmented generation engine pulls real-time store inventory and latest government yojanas before formulating recommendations.
              </p>
            </div>

            <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <Cpu className="w-4.5 h-4.5 text-emerald-500" />
                <span>Model: Gemini 3.1 Flash Lite</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                <span>Verified Catalog Context</span>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4.5 h-4.5 text-emerald-500" />
                <span>Auto-linking Store URLs</span>
              </div>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm flex-1 hidden md:flex flex-col gap-3">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Suggested Queries</h3>
            <div className="flex flex-col gap-2">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt.replace(/^[^\s]+\s+/, ""))}
                  className="text-left text-xs bg-zinc-50 dark:bg-zinc-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-zinc-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-400 border border-zinc-200/30 dark:border-zinc-800/30 p-3 rounded-xl transition-all cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Central Chat Board */}
        <div className="flex-1 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl shadow-xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-600/10 flex items-center justify-center border border-emerald-500/20 overflow-hidden">
                  <BlinkingBotIcon className="w-7 h-7" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-950 rounded-full" />
              </div>
              <div>
                <h3 className="font-black text-base text-[var(--foreground)] tracking-wide">AgriBot Assistant</h3>
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active Store Context</p>
              </div>
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} 
                className={`p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 border border-zinc-200/40 dark:border-zinc-800/40 cursor-pointer ${isLangMenuOpen ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-500/20" : ""}`}
                title="Choose Language"
              >
                <Languages className="w-4 h-4" />
                <span>{language}</span>
              </button>
              
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl shadow-xl z-30 p-2 flex flex-col gap-1">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.name)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        language === lang.name
                          ? "bg-emerald-600 text-white"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-[9px] uppercase tracking-wide opacity-80">{lang.name}</span>
                        <span className="text-[12px] font-black">{lang.nativeName}</span>
                      </div>
                      {language === lang.name && (
                        <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 bg-zinc-50/20 dark:bg-zinc-900/5">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm border ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white border-emerald-700/30 rounded-tr-none"
                      : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200/50 dark:border-zinc-800/50 rounded-tl-none"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert">
                      {renderMessageContent(msg.content)}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-2xl border border-red-200/30 dark:border-red-900/20 text-sm font-semibold max-w-[80%]">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-4 border-t border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 flex gap-3 items-center shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AgriBot about tomato yields, government yojanas, crop protection..."
              className="flex-1 bg-zinc-100 dark:bg-zinc-900 border-none outline-none focus:ring-1 focus:ring-emerald-500/50 rounded-2xl px-5 py-3.5 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 font-medium"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:shadow-none cursor-pointer"
            >
              <span>Send Message</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  );
}
