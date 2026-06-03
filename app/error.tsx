"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, AlertTriangle, ShieldAlert } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an analytics service or reporting utility
    console.error("Agrinex Global Error Intercepted:", error);
  }, [error]);

  return (
    <div className="bg-[#fcfcfc] dark:bg-[#0a0a0a] min-h-screen flex flex-col transition-colors duration-500 font-sans">
      <Header showTopBar={false} />

      <main className="flex-1 container mx-auto px-4 py-16 md:py-24 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Decorative Background Glows */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-[120px] -z-10 animate-pulse duration-5000"></div>

        {/* Brand/Security Accent Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto shadow-inner relative group cursor-default">
            <ShieldAlert className="text-red-500 h-10 w-10 animate-pulse" />
          </div>
        </div>

        {/* Main Header Text */}
        <div className="text-center max-w-2xl">
          <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20">
            System Boundary Crash
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--foreground)] uppercase tracking-tight mt-6">
            Something Went Wrong
          </h1>
          <p className="text-gray-400 dark:text-gray-500 text-xs md:text-sm font-bold mt-3 max-w-md mx-auto leading-relaxed">
            An unexpected error occurred during crop data loading or layout composition. Our engine has isolated this thread to secure your shopping cart.
          </p>
        </div>



        {/* Controls Option Bar */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mt-10 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-[#1b6b3e] hover:bg-[#1b6b3e]/90 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-102 active:scale-98 shadow-lg shadow-[#1b6b3e]/20"
          >
            <RefreshCw size={14} className="animate-spin duration-3000" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-3 px-8 py-4 bg-[var(--card)] border border-[var(--border)] hover:border-[#1b6b3e] text-[var(--foreground)] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-102 active:scale-98 shadow-sm"
          >
            <Home size={14} className="text-gray-400" />
            Return Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
