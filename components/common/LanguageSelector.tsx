"use client";

import React, { useState, useEffect, useRef } from "react";
import { Languages, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
];

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(languages[0]);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync with Google Translate cookie on mount
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    const googtrans = getCookie("googtrans");
    if (googtrans) {
      const targetLang = googtrans.split("/").pop();
      const matched = languages.find(l => l.code === targetLang);
      if (matched) {
        setSelected(matched);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (lang: typeof languages[0]) => {
    setSelected(lang);
    setIsOpen(false);
    
    // 1. Set the Google Translate cookies (both standard and host-specific)
    document.cookie = `googtrans=/en/${lang.code}; path=/;`;
    document.cookie = `googtrans=/en/${lang.code}; path=/; domain=${window.location.hostname};`;
    
    // 2. Fallback to programmatically trigger change if DOM select box is active
    const selectElement = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (selectElement) {
      selectElement.value = lang.code;
      selectElement.dispatchEvent(new Event("change"));
    }
    
    // 3. Reload the window to guarantee Google Translate applies the cookie on first click
    window.location.reload();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:text-[#1b6b3e] transition-colors uppercase tracking-widest text-[10px] font-black group"
      >
        <Languages size={14} className="group-hover:rotate-12 transition-transform" />
        <span>{selected.native}</span>
        <ChevronDown size={10} className={cn("transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-48 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
              <div className="p-2 grid grid-cols-1 gap-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left group",
                      selected.code === lang.code 
                        ? "bg-[#1b6b3e] text-white" 
                        : "hover:bg-[#1b6b3e]/5 text-gray-500 dark:text-gray-400"
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{lang.label}</span>
                      <span className="text-xs font-bold leading-none">{lang.native}</span>
                    </div>
                    {selected.code === lang.code && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
