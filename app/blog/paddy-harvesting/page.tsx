"use client";

import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ChevronRight, Calendar, User, ArrowLeft, Sun, Wrench, ThermometerSun, Leaf } from "lucide-react";

export default function PaddyHarvestingBlog() {
  return (
    <main className="min-h-screen bg-[var(--background)] transition-colors duration-500">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-[var(--card)] border-b border-[var(--border)] py-4 transition-colors duration-500">
        <div className="container mx-auto px-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
          <Link href="/" className="hover:text-[#1b6b3e] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#1b6b3e]">Blog</span>
          <ChevronRight size={12} />
          <span className="text-[var(--foreground)] truncate">Paddy Harvesting Best Practices</span>
        </div>
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-4 py-16 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#1b6b3e] hover:underline mb-8"
        >
          <ArrowLeft size={14} /> Back to Homepage
        </Link>

        {/* Category & Title */}
        <div className="space-y-4 mb-8">
          <span className="inline-block bg-orange-100 dark:bg-orange-950/30 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Machinery
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--foreground)] leading-tight">
            Paddy Harvesting: Best Practices & Equipment for High Yield
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-gray-400 border-y border-[var(--border)] py-4">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#1b6b3e]" />
              <span>Published on May 05, 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={14} className="text-[#1b6b3e]" />
              <span>By Agrinex Farm Machinery Team</span>
            </div>
          </div>
        </div>

        {/* Feature Image */}
        <div className="w-full h-96 rounded-[40px] overflow-hidden mb-12 shadow-xl border border-[var(--border)]">
          <img 
            src="/paddy_harvesting.png" 
            alt="Paddy harvesting tractor" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Body Text */}
        <div className="space-y-8 text-base text-[var(--foreground)]/80 leading-relaxed font-medium">
          <p className="text-lg font-bold text-[var(--foreground)]">
            Harvesting is one of the most critical stages of Rice (Paddy) cultivation. Harvesting too early results in a high percentage of chalky, immature grains, whereas harvesting too late causes heavy grain shattering and cracking. Adopting best practices and utilizing the right machinery can save labor and boost milling returns.
          </p>

          <h3 className="text-2xl font-black text-[var(--foreground)] pt-4 border-b border-[var(--border)] pb-2 flex items-center gap-2">
            <ThermometerSun className="text-[#1b6b3e]" /> 1. Identifying the Right Harvesting Window
          </h3>
          <p>
            Timing is everything. Harvesting should be performed when the crop meets the following indicators:
          </p>
          <ul className="space-y-3 list-inside list-disc pl-2">
            <li><strong>Grain Maturity:</strong> Approximately 80-85% of grains on the panicle should turn straw or golden-colored.</li>
            <li><strong>Time after Flowering:</strong> Generally around 30-35 days after full flowering (heading).</li>
            <li><strong>Moisture Content:</strong> The optimal moisture content of paddy grains should be between 20% and 22% for combine harvesting and 21% to 24% for manual harvesting.</li>
          </ul>

          <h3 className="text-2xl font-black text-[var(--foreground)] pt-4 border-b border-[var(--border)] pb-2 flex items-center gap-2">
            <Sun className="text-[#1b6b3e]" /> 2. Post-Harvest Drying & Storage
          </h3>
          <p>
            Drying paddy promptly is essential to prevent grain discoloration, fungal growth, and rot.
          </p>
          <ul className="space-y-3 list-inside list-disc pl-2">
            <li><strong>Drying Threshold:</strong> Within 24 hours of harvest, dry the paddy to a safe moisture level of 14% for short-term storage and 12% for long-term storage.</li>
            <li><strong>Traditional Sun Drying:</strong> Spread grains on clean mats/concrete in thin layers (3-4 cm) and stir them every 30 minutes to ensure uniform drying.</li>
            <li><strong>Mechanical Hot Air Dryers:</strong> Highly recommended during rainy harvest seasons to control temperature (maximum 43°C for seed paddy) and maintain premium seed viability.</li>
          </ul>

          <h3 className="text-2xl font-black text-[var(--foreground)] pt-4 border-b border-[var(--border)] pb-2 flex items-center gap-2">
            <Wrench className="text-[#1b6b3e]" /> 3. Advanced Machinery Solutions
          </h3>
          <p>
            With agricultural labor shortages, combine harvesters and threshers have become highly cost-effective:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)] space-y-3">
              <h4 className="font-black text-[#1b6b3e] uppercase tracking-wider text-xs">Combine Harvesters</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                A single machine that completes cutting, threshing, and cleaning operations simultaneously. Reduces field losses to less than 3% and saves extensive labor time.
              </p>
            </div>

            <div className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)] space-y-3">
              <h4 className="font-black text-orange-500 uppercase tracking-wider text-xs">Power Reapers & Threshers</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                A motorized reaper cuts the crop and lays it flat, followed by mechanical threshers to separate grains. Ideal for smaller plots where large combine harvesters cannot navigate.
              </p>
            </div>
          </div>

          <h3 className="text-2xl font-black text-[var(--foreground)] pt-4 border-b border-[var(--border)] pb-2 flex items-center gap-2">
            <Leaf className="text-orange-500" /> Key Maintenance Tips
          </h3>
          <ol className="space-y-3 list-inside list-decimal pl-2">
            <li>Ensure harvester cutter bars are sharp to avoid tearing or uprooting stalks.</li>
            <li>Adjust combine drum speed according to the crop feed rate to prevent grain cracking.</li>
            <li>Clean the machine thoroughly before moving to a new field to prevent weed seed contamination.</li>
          </ol>
        </div>
      </article>

      <Footer />
    </main>
  );
}
