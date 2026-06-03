"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const categories = [
  { name: "Seeds", icon: "🌾", color: "bg-green-50 dark:bg-green-950/20" },
  { name: "Protection", icon: "🛡️", color: "bg-blue-50 dark:bg-blue-950/20" },
  { name: "Nutrition", icon: "🌱", color: "bg-amber-50 dark:bg-amber-950/20" },
  { name: "Machinery", icon: "🚜", color: "bg-orange-50 dark:bg-orange-950/20" },
  { name: "Irrigation", icon: "💧", color: "bg-cyan-50 dark:bg-cyan-950/20" },
  { name: "Livestock", icon: "🐄", color: "bg-rose-50 dark:bg-rose-950/20" },
  { name: "Organic", icon: "🌿", color: "bg-emerald-50 dark:bg-emerald-950/20" },
  { name: "Household", icon: "🏠", color: "bg-purple-50 dark:bg-purple-950/20" },
];

const CategoryBar = () => {
  return (
    <div className="w-full bg-[var(--card)] py-8 overflow-x-auto no-scrollbar border-b border-[var(--border)] transition-colors duration-500">
      <div className="container mx-auto px-4 flex gap-4 md:gap-6 lg:justify-between min-w-max lg:min-w-0">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="flex flex-col items-center gap-3 group cursor-pointer w-28 md:w-32"
          >
            <div className={cn(
                "w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-105 transition-all shadow-sm border border-[var(--border)] group-hover:shadow-md group-hover:border-[#1b6b3e]/20",
                cat.color
            )}>
              {cat.icon}
            </div>
            <span className="text-xs md:text-sm font-black text-[var(--foreground)] text-center uppercase tracking-wider group-hover:text-[#1b6b3e] transition-colors">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;
