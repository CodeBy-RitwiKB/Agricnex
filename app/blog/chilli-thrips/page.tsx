"use client";

import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ChevronRight, Calendar, User, ArrowLeft, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ChilliThripsBlog() {
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
          <span className="text-[var(--foreground)] truncate">Managing Black Thrips in Chilli</span>
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
            Crop Protection
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--foreground)] leading-tight">
            Managing Black Thrips (Thrips parvispinus) in Chilli Crops
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-gray-400 border-y border-[var(--border)] py-4">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#1b6b3e]" />
              <span>Published on May 10, 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={14} className="text-[#1b6b3e]" />
              <span>By Agrinex Advisory Team</span>
            </div>
          </div>
        </div>

        {/* Feature Image */}
        <div className="w-full h-96 rounded-[40px] overflow-hidden mb-12 shadow-xl border border-[var(--border)]">
          <img 
            src="/chilli_farming.png" 
            alt="Chilli crop fields" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Body Text */}
        <div className="space-y-8 text-base text-[var(--foreground)]/80 leading-relaxed font-medium">
          <p className="text-lg font-bold text-[var(--foreground)]">
            In recent seasons, Chilli farmers across India have faced a major agricultural crisis due to the outbreak of the invasive pest Black Thrips (Thrips parvispinus). Originally originating from Southeast Asia, this pest feeds heavily on flowers and tender shoots, causing severe crop damage, flower drop, and up to 80-90% yield losses if unchecked.
          </p>

          <h3 className="text-2xl font-black text-[var(--foreground)] pt-4 border-b border-[var(--border)] pb-2 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" /> Key Symptoms to Watch For
          </h3>
          <ul className="space-y-3 list-inside list-disc pl-2">
            <li><strong>Downward leaf curling:</strong> Leaves curl downwards and turn brittle or papery.</li>
            <li><strong>Silvering on leaf undersides:</strong> Scraping of plant tissues leaves a distinct silvery sheen.</li>
            <li><strong>Flower shedding:</strong> Extensive infestation causes immediate flower drop, preventing fruit setting.</li>
            <li><strong>Brownish discoloration:</strong> Scars on leaf veins, buds, and young pods.</li>
          </ul>

          <h3 className="text-2xl font-black text-[var(--foreground)] pt-4 border-b border-[var(--border)] pb-2 flex items-center gap-2">
            <ShieldAlert className="text-[#1b6b3e]" /> Integrated Pest Management (IPM) Practices
          </h3>
          <p>
            Relying solely on chemical insecticides often leads to pest resistance. An Integrated Pest Management (IPM) strategy is highly recommended for durable control:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)] space-y-3">
              <h4 className="font-black text-[#1b6b3e] uppercase tracking-wider text-xs">Cultural & Physical Practices</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li>• Deep summer ploughing to expose pupae to natural sunlight.</li>
                <li>• Use high-efficiency blue sticky traps (30-40 traps per acre) to monitor and capture adult thrips.</li>
                <li>• Maintain optimum plant spacing and clean borders to prevent host weed growth.</li>
              </ul>
            </div>

            <div className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)] space-y-3">
              <h4 className="font-black text-orange-500 uppercase tracking-wider text-xs">Biological Practices</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li>• Conserve natural predators like ladybird beetles, lacewings, and predatory mites.</li>
                <li>• Spray neem oil formulations (10,000 ppm) at early infestation stages.</li>
                <li>• Apply beneficial fungi like Beauveria bassiana or Lecanicillium lecanii.</li>
              </ul>
            </div>
          </div>

          <h3 className="text-2xl font-black text-[var(--foreground)] pt-4 border-b border-[var(--border)] pb-2 flex items-center gap-2">
            <CheckCircle2 className="text-[#1b6b3e]" /> Recommended Chemical Controls
          </h3>
          <p>
            If infestation crosses the Economic Threshold Level (ETL) of 5 thrips per flower, chemical sprays should be initiated in rotation to prevent resistance development:
          </p>

          <table className="w-full text-left text-sm border-collapse rounded-2xl overflow-hidden border border-[var(--border)]">
            <thead>
              <tr className="bg-[var(--card)] font-black text-[var(--foreground)] border-b border-[var(--border)]">
                <th className="p-4">Chemical Ingredient</th>
                <th className="p-4">Recommended Dosage</th>
                <th className="p-4">Application Phase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] font-bold text-gray-500 dark:text-gray-400">
              <tr>
                <td className="p-4 text-[var(--foreground)]">Spinetoram 11.7% SC</td>
                <td className="p-4">180 ml / acre</td>
                <td className="p-4">Vegetative/Early Flowering</td>
              </tr>
              <tr>
                <td className="p-4 text-[var(--foreground)]">Fipronil 5% SC</td>
                <td className="p-4">400 ml / acre</td>
                <td className="p-4">Early vegetative stage</td>
              </tr>
              <tr>
                <td className="p-4 text-[var(--foreground)]">Acetamiprid 20% SP</td>
                <td className="p-4">80-100 g / acre</td>
                <td className="p-4">Flowering & Fruit formation</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <Footer />
    </main>
  );
}
