"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Home, ShoppingBag, PhoneCall, Leaf, Sparkles, ChevronRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="bg-[var(--background)] min-h-screen flex flex-col transition-[background-color] duration-500 font-sans">
      <Header showTopBar={false} />

      <main className="flex-1 container mx-auto px-4 py-16 md:py-24 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Abstract Agricultural Animated Background Shapes */}
        <div 
          className="absolute top-1/4 left-1/10 w-96 h-96 bg-[#1b6b3e]/5 dark:bg-[#1b6b3e]/10 rounded-full blur-[120px] -z-10 animate-pulse"
          style={{ animationDuration: "5s" }}
        />
        <div 
          className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-[#ff9900]/5 dark:bg-[#ff9900]/10 rounded-full blur-[120px] -z-10 animate-pulse"
          style={{ animationDuration: "7s" }}
        />

        {/* Brand Logo & Accent Sparkle */}
        <div className="relative mb-6">
          <div className="relative group cursor-default">
            <img 
              src="https://res.cloudinary.com/dhpvb2emj/image/upload/q_auto/f_auto/v1778241361/logo.png" 
              alt="Agrinex Logo" 
              className="h-12 w-auto object-contain select-none transition-transform hover:scale-105"
            />
            <Sparkles className="absolute -top-3 -right-3 text-[#ff9900] h-5 w-5 animate-pulse" />
          </div>
        </div>

        {/* 404 Large Dynamic Text */}
        <div className="text-center max-w-2xl">
          <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-[#1b6b3e] uppercase leading-none drop-shadow-md select-none">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)] uppercase tracking-tight mt-4">
            Route Not Planted Yet!
          </h2>
          <p className="text-gray-400 dark:text-gray-500 text-xs md:text-sm font-bold mt-3 max-w-md mx-auto leading-relaxed">
            The page you are trying to cultivate does not exist, or has been harvested and relocated to another coordinates.
          </p>
        </div>

        {/* Dynamic E-Commerce Product Search */}
        <div className="w-full max-w-md mt-10">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1b6b3e] transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search products, machinery, or seeds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl py-4 pl-14 pr-16 text-xs font-black focus:outline-none focus:border-[#1b6b3e] transition-all shadow-md placeholder-gray-500"
            />
            <button
              type="submit"
              className="absolute inset-y-2 right-2 px-5 bg-[#1b6b3e] hover:bg-[#1b6b3e]/90 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-102 active:scale-98"
            >
              Search
            </button>
          </form>
        </div>

        {/* Quick Navigation Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl mt-12">
          <Link
            href="/"
            className="flex flex-col items-center p-6 bg-[var(--card)] border border-[var(--border)] hover:border-[#1b6b3e] rounded-[30px] shadow-sm hover:shadow-xl transition-all group text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#1b6b3e]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Home className="text-[#1b6b3e]" size={20} />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)]">Marketplace</h3>
            <p className="text-[9px] font-bold text-gray-400 mt-1">Back to our main shopping platform</p>
          </Link>

          <Link
            href="/products"
            className="flex flex-col items-center p-6 bg-[var(--card)] border border-[var(--border)] hover:border-[#ff9900] rounded-[30px] shadow-sm hover:shadow-xl transition-all group text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShoppingBag className="text-[#ff9900]" size={20} />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)]">Browse Seeds</h3>
            <p className="text-[9px] font-bold text-gray-400 mt-1">Explore all agricultural inventory</p>
          </Link>

          <Link
            href="/support"
            className="flex flex-col items-center p-6 bg-[var(--card)] border border-[var(--border)] hover:border-[#b37c3a] rounded-[30px] shadow-sm hover:shadow-xl transition-all group text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PhoneCall className="text-[#b37c3a]" size={20} />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)]">Support</h3>
            <p className="text-[9px] font-bold text-gray-400 mt-1">Get custom professional guidance</p>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
