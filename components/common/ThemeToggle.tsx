"use client";

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: (isDark: boolean) => void;
  accentColor?: string;
  duration?: number;
  className?: string;
}

/**
 * ThemeToggle Component
 * A premium, reusable theme switcher with a Majestic Radial Bloom effect.
 * Uses the modern View Transition API for a cinematic theme-reveal experience.
 */
const ThemeToggle = ({ 
  isDarkMode, 
  onToggle, 
  accentColor = "#1b6b3e",
  duration = 1.5,
  className
}: ThemeToggleProps) => {
  const isTransitioning = useRef(false);

  const handleToggle = (e: React.MouseEvent) => {
    if (isTransitioning.current) return;

    const x = e.clientX;
    const y = e.clientY;

    // @ts-ignore - View Transition API is still experimental in some browsers/types
    if (!document.startViewTransition) {
      onToggle(!isDarkMode);
      return;
    }

    isTransitioning.current = true;
    
    document.documentElement.style.setProperty('--x', `${x}px`);
    document.documentElement.style.setProperty('--y', `${y}px`);
    document.documentElement.style.setProperty('--reveal-duration', `${duration}s`);

    // @ts-ignore
    const transition = document.startViewTransition(() => {
      onToggle(!isDarkMode);
    });

    transition.finished.finally(() => {
      isTransitioning.current = false;
    });
  };

  return (
    <>
      <button 
        onClick={handleToggle}
        className={cn(
          "p-2.5 rounded-xl transition-all relative overflow-hidden group border border-transparent hover:border-gray-100",
          isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200',
          className
        )}
        aria-label="Toggle Theme"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isDarkMode ? 'sun' : 'moon'}
            initial={{ y: 20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="relative z-10"
          >
            {isDarkMode ? (
              <Sun size={20} className="text-[#ff9900] group-hover:scale-110 transition-transform" />
            ) : (
              <Moon size={20} className="text-gray-600 group-hover:scale-110 transition-transform" />
            )}
          </motion.div>
        </AnimatePresence>
        
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl",
          isDarkMode ? 'bg-white/10' : 'bg-[#1b6b3e]/5'
        )} />
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none;
          mix-blend-mode: normal;
        }

        ::view-transition-old(root) {
          z-index: 1;
        }

        ::view-transition-new(root) {
          z-index: 999999;
          animation: radial-reveal var(--reveal-duration, 1.5s) cubic-bezier(0.4, 0, 0.2, 1) forwards;
          clip-path: circle(0% at var(--x, 50%) var(--y, 50%));
        }

        @keyframes radial-reveal {
          from { clip-path: circle(0% at var(--x) var(--y)); }
          to { clip-path: circle(150% at var(--x) var(--y)); }
        }

        html { view-transition-name: none; }
        body { view-transition-name: root; }
      `}} />
    </>
  );
};

export default ThemeToggle;
