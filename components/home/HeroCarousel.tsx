"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const slides = [
  {
    id: 1,
    title: "Mahadhan Vegetable Special",
    subtitle: "Grow better vegetables for higher yield! Targets: Tomato, Chilli, Beans, Cucumber, Brinjal.",
    badge: "Best For Vegetable Crops",
    button: "Shop Mahadhan",
    bg: "bg-[#0d1a0d]",
    bgImage: "/mahadhan-bg.png",
    textColor: "text-white",
    image: "/mahadhan-promo.png",
    accent: "bg-[#ff9900]",
    link: "/products?category=crop nutrition"
  },
  {
    id: 2,
    title: "Explore Insecticides",
    subtitle: "Get quick knockdown action of pests with Evergol Xtend Brand: Bayer.",
    badge: "Crop Protection Specialist",
    button: "View Exyprole",
    bg: "bg-[#1a140d]",
    bgImage: "/exyprole-bg.png",
    textColor: "text-white",
    image: "/exyprole-promo.png",
    accent: "bg-[#1b6b3e]",
    link: "/products?category=crop protection"
  },
  {
    id: 3,
    title: "Hybrid Seeds for High Yield",
    subtitle: "High Quality Hybrid Seeds: Watermelon, Muskmelon, Cucumber, Sweet Corn.",
    badge: "Farmer's First Choice",
    button: "Explore Seeds",
    bg: "bg-[#0d161a]",
    bgImage: "/seeds-bg.png",
    textColor: "text-white",
    image: "/seeds-promo.png",
    accent: "bg-[#ff9900]",
    link: "/products?category=seeds"
  },
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [current, isPaused]);

  return (
    <div
      className="relative w-full h-[420px] md:h-[538px] overflow-hidden bg-[var(--background)] mt-0 border-b border-[var(--border)] transition-colors duration-500"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className={cn("absolute inset-0 flex items-center justify-between transition-colors duration-1000 overflow-hidden", slides[current].bg)}
          >
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 z-0">
              <img
                src={slides[current].bgImage}
                alt=""
                className="w-full h-full object-cover opacity-25 scale-105 transition-transform duration-[10000ms] animate-slow-zoom mix-blend-multiply"
              />
            </div>

            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05]"></div>

            <div className="container mx-auto px-8 md:px-20 flex items-center justify-between w-full h-full relative z-10">
              <div className="flex flex-col items-start max-w-2xl z-10">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className={cn("px-4 py-1.5 rounded-full text-white text-[9px] font-black uppercase tracking-widest mb-4 shadow-md", slides[current].accent)}
                >
                  {slides[current].badge}
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                  className={cn("text-5xl md:text-7xl font-black mb-6 leading-[1.05] tracking-tighter transition-colors duration-1000", slides[current].textColor)}
                >
                  {slides[current].title.split(' ').map((word, i) => (
                    <span key={i} className={cn(
                      "inline-block mr-3 md:mr-4",
                      i === 1 ? "text-orange-500 italic block md:inline" : ""
                    )}>
                      {word}
                    </span>
                  ))}
                </motion.h2>
                 <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-base md:text-xl text-white/80 font-medium mb-10 max-w-lg leading-relaxed"
                >
                  {slides[current].subtitle}
                </motion.p>
                <Link href={slides[current].link}>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05, translateY: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn("px-10 py-5 rounded-2xl text-white font-black text-lg shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all flex items-center gap-3", slides[current].accent)}
                  >
                    {slides[current].button}
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 1, delay: 0.2, ease: "circOut" }}
                className="hidden md:flex items-center justify-center w-1/2 h-full relative"
              >
                <img
                  src={slides[current].image}
                  alt={slides[current].title}
                  className="max-h-[85%] w-auto object-contain z-10 animate-float drop-shadow-[0_50px_50px_rgba(0,0,0,0.3)] mix-blend-normal rounded-3xl"
                />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-[var(--card)]/80 hover:bg-[var(--card)] p-3 rounded-2xl text-[#1b6b3e] shadow-xl transition-all z-20 border border-[var(--border)]"
        >
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-[var(--card)]/80 hover:bg-[var(--card)] p-3 rounded-2xl text-[#1b6b3e] shadow-xl transition-all z-20 border border-[var(--border)]"
        >
          <ChevronRight size={24} strokeWidth={3} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-3 rounded-full transition-all border-2 border-white dark:border-gray-800 shadow-sm ${i === current ? "bg-[#1b6b3e] w-10" : "bg-white/50 dark:bg-gray-800/50 w-3"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
