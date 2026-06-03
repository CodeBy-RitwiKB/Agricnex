"use client";

import React from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DealItem {
  id: number;
  name: string;
  offer: string;
  image: string;
  category: string;
}

interface DealSectionProps {
  title: string;
  items: DealItem[];
  bgColor?: string;
  showMascot?: boolean;
}

const DealSection = ({ title, items, bgColor = "bg-fk-blue", showMascot = true }: DealSectionProps) => {
  return (
    <section className="container mx-auto px-4 py-6">
      <div className={cn("rounded-xl p-3 md:p-4 shadow-lg relative overflow-hidden", bgColor)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{title}</h2>
          <button className="bg-white text-agri-brown p-1.5 rounded-full shadow-md hover:scale-110 transition-transform">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Peaking Character (Top Right) */}
        {/* Peaking Character (Top Right) */}
        <div className="absolute -top-7 right-12 md:right-24 w-28 h-28 hidden sm:block">
            <Image
            src="/peaking character.png"
              alt="Peaking Character"
              width={112}
              height={112}
              className="object-contain"
            />
          </div>

        {/* Items Container */}
        <div className="bg-white rounded-lg p-3 md:p-6 flex gap-3 md:gap-4 overflow-x-auto no-scrollbar">
          {items.map((item) => (
            <div 
              key={item.id}
              className="min-w-[180px] md:min-w-[calc(20%-13px)] flex flex-col group cursor-pointer"
            >
              <div className="h-40 md:h-60 bg-gray-50 rounded-md mb-4 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform overflow-hidden p-6 border border-gray-100">
                {item.image}
              </div>
              <div className="px-1 text-center">
                <p className="text-base font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                <p className="text-lg font-bold text-black mt-1">{item.offer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DealSection;
