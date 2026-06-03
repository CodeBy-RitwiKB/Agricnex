"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, AlertCircle, Maximize2, Minimize2, Languages } from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "🌱 Suggest high-yield crop seeds",
  "🪱 Best organic pesticide for leaf spots?",
  "🌾 Government schemes for farmers?",
  "🧪 Top fertilizers for tomato plants",
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
  "English": "Hello! I am **AgriBot**, your agricultural assistant. Ask me anything about our farm products, crop advice, fertilizers, or government schemes! 🌾",
  "Hindi": "नमस्ते! मैं **एग्रीबॉट** हूँ, आपका कृषि सहायक। मुझसे हमारे कृषि उत्पादों, फसल सलाह, उर्वरकों, या सरकारी योजनाओं के बारे में कुछ भी पूछें! 🌾",
  "Marathi": "नमस्कार! मी **ऍग्रीबॉट** आहे, तुमचा शेती सहाय्यक. मला आमच्या शेती उत्पादनांबद्दल, पीक सल्ल्याबद्दल, खतांबद्दल किंवा सरकारी योजनांबद्दल काहीही विचारा! 🌾",
  "Punjabi": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ **ਐਗਰੀਬੋਟ** ਹਾਂ, ਤੁਹਾਡਾ ਖेਤੀਬਾੜੀ ਸਹਾਇਕ। ਸਾਡੇ ਖੇਤ ਉਤਪਾਦਾਂ, ਫਸਲਾਂ ਦੀ ਸਲਾਹ, ਖਾਦਾਂ, ਜਾਂ ਸਰਕਾਰੀ ਸਕੀಮਾਂ ਬਾਰੇ ਮੈਨੂੰ ਕੁਝ ਵੀ ਪੁੱਛੋ! 🌾",
  "Telugu": "నమస్తే! నేను **అగ్రిబాట్**, మీ వ్యవసాయ సహాయకుడిని. మా వ్యవసాయ ఉత్పత్తులు, పంటల సలహాలు, ఎరువులు లేదా ప్రభుత్వ పథకాల గురించి నన్ను ఏదైనా అడగండి! 🌾",
  "Tamil": "வணக்கம்! நான் **அக்ரிபாட்**, உங்கள் விவசாய உதவியாளர். எங்களது விவசாய தயாரிப்புகள், பயிர் ஆலோசனை, உரங்கள் அல்லது அரசு திட்டங்கள் பற்றி என்னிடம் கேளுங்கள்! 🌾",
  "Kannada": "ನಮಸ್ಕಾರ! ನಾನು **ಅಗ್ರಿಬಾಟ್**, ನಿಮ್ಮ ಕೃಷಿ ಸಹಾಯಕ. ನಮ್ಮ ಕೃಷಿ ಉತ್ಪನ್ನಗಳು, ಬೆಳೆ ಸಲಹೆಗಳು, ರಸಗೊಬ್ಬರಗಳು ಅಥವಾ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ನನಗೆ ಯಾವುದನ್ನಾದರೂ ಕೇಳಿ! 🌾"
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

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [language, setLanguage] = useState("English");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: WELCOME_MESSAGES["English"],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Translate welcome message when language changes
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
        throw new Error(data.error || "Failed to get response from AgriBot.");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Simple, high-fidelity markdown parser for bold, lists, headings, dividers, and links
  const renderMessageContent = (text: string) => {
    // Escape HTML to prevent XSS
    const escapeHtml = (str: string) => {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    // Convert newlines to breaks and simple lists
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
        return `<a href="${linkUrl}" class="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/30 inline-flex items-center gap-0.5 transition-colors">${linkText}</a>`;
      });

      const contentNode = <span dangerouslySetInnerHTML={{ __html: html }} />;

      if (isHeading) {
        if (depth === 1) return <h1 key={lineIdx} className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-3 mb-1.5">{contentNode}</h1>;
        if (depth === 2) return <h2 key={lineIdx} className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-3 mb-1.5">{contentNode}</h2>;
        return <h3 key={lineIdx} className="text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-3 mb-1.5">{contentNode}</h3>;
      }

      if (isList) {
        return (
          <li key={lineIdx} className="ml-4 list-disc mb-1 text-[15px] leading-relaxed">
            {contentNode}
          </li>
        );
      }

      return (
        <p key={lineIdx} className="mb-2 text-[15px] leading-relaxed break-words">
          {contentNode}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "64px" : "min(550px, calc(100vh - 120px))",
              width: isMinimized ? "320px" : "440px"
            }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mb-4 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-w-[calc(100vw-32px)]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 flex items-center justify-between text-white shrink-0 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/10 overflow-hidden">
                    <BlinkingBotIcon className="w-6 h-6" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-emerald-600 rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm tracking-wide">AgriBot Assistant</h3>
                  <p className="text-[11px] text-emerald-100/90 flex items-center gap-1">
                    <span>Expert AI Agent</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className={`p-1 hover:bg-white/10 rounded transition-colors ${isLangMenuOpen ? "text-emerald-200 bg-white/10" : ""}`}
                  title="Choose Language"
                >
                  <Languages className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title={isMinimized ? "Expand" : "Minimize"}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Close"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Language Selection Menu Overlay */}
            {isLangMenuOpen && !isMinimized && (
              <div className="absolute inset-x-0 top-[52px] bottom-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md z-30 flex flex-col p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-900/50">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Select Language</span>
                  <button onClick={() => setIsLangMenuOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.name)}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${language === lang.name
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10"
                          : "bg-zinc-50 dark:bg-zinc-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300"
                        }`}
                    >
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-[9px] uppercase tracking-wide opacity-80">{lang.name}</span>
                        <span className="text-[13px] font-black">{lang.nativeName}</span>
                      </div>
                      {language === lang.name && (
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isMinimized && (
              <>
                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-zinc-50/50 dark:bg-zinc-900/10 min-h-0">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm border ${msg.role === "user"
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
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1">
                        <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-xl border border-red-200/30 dark:border-red-900/20 text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggestions Section */}
                {messages.length === 1 && !isLoading && (
                  <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 shrink-0">
                    <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Common Questions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTIONS.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(s.replace(/^[^\s]+\s+/, ""))}
                          className="text-xs text-left bg-zinc-100 dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-zinc-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-400 border border-zinc-200/40 dark:border-zinc-800/40 px-2.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Footer */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend(input);
                  }}
                  className="p-3 border-t border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 flex gap-2 shrink-0 items-center"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about crops, products, seeds..."
                    className="flex-1 bg-zinc-100 dark:bg-zinc-900 border-none outline-none focus:ring-1 focus:ring-emerald-500/50 rounded-xl px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shadow-md disabled:opacity-50 disabled:shadow-none cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Bubble */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center shadow-2xl border border-emerald-500/20 cursor-pointer relative"
      >
        {isOpen ? <X className="w-8 h-8" /> : <BlinkingBotIcon className="w-14 h-14" />}
      </motion.button>
    </div>
  );
}
