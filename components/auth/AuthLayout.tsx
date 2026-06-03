"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Zap, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  image?: string;
  type?: "admin" | "merchant" | "user";
}

const AuthLayout = ({ children, title, subtitle, image, type = "user" }: AuthLayoutProps) => {
  return (
    <div className={cn(
      "min-h-screen flex transition-colors duration-500",
      type === "admin" ? "bg-[#050505]" : "bg-[var(--background)]"
    )}>
      {/* Left Side: Brand Story (Hidden on mobile) */}
      <div className={cn(
        "hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-20 transition-all duration-700",
        type === "admin" ? "bg-[#050505]" : "bg-[#1b6b3e]"
      )}>
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
            <img 
                src={image || "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?q=80&w=2070&auto=format&fit=crop"} 
                alt="Background" 
                className="w-full h-full object-cover opacity-60 transition-transform duration-[10s] hover:scale-110"
            />
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br",
                type === "admin" 
                    ? "from-black via-black/80 to-red-900/20" 
                    : "from-black via-black/70 to-transparent"
            )}></div>
        </div>

        <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-[120px] -ml-48 -mt-48 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ff9900] rounded-full blur-[120px] -mr-48 -mb-48 animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="relative transition-transform group-hover:scale-110">
              <img 
                src="https://res.cloudinary.com/dhpvb2emj/image/upload/q_auto/f_auto/v1778241361/logo.png" 
                alt="Agrinex Logo" 
                className="h-14 w-auto object-contain"
              />
            </div>
            <div className="flex flex-col -space-y-1">
                <span className="text-2xl font-black tracking-tighter text-white uppercase">Agrinex</span>
                <span className="text-[8px] font-black text-[#ff9900] uppercase tracking-[0.4em] ml-0.5">Digital Marketplace</span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white leading-tight tracking-tighter drop-shadow-2xl">
              {type === "admin" && <>Command the<br /><span className="text-red-500">System.</span></>}
              {type === "merchant" && <>Scale your<br /><span className="text-[#ff9900]">Business.</span></>}
              {type === "user" && <>Empowering the<br /><span className="text-[#ff9900]">Future of Farming.</span></>}
            </h1>
            <p className="text-xl text-white font-bold max-w-md leading-relaxed drop-shadow-lg">
              {type === "admin" && "Manage the entire Agrinex ecosystem from a single, high-security command center."}
              {type === "merchant" && "Join India's most trusted digital marketplace. Sell your products to thousands of farmers across the country."}
              {type === "user" && "Join India's most trusted digital marketplace for agricultural excellence. Shop seeds, fertilizers, and more."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <ShieldCheck className={type === "admin" ? "text-red-500" : "text-[#ff9900]"} size={20} />
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                {type === "merchant" ? "Safe Payments" : "Secure Access"}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Zap className={type === "admin" ? "text-red-500" : "text-[#ff9900]"} size={20} />
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                {type === "merchant" ? "Instant Sales" : "Real-time Data"}
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
          &copy; 2026 Agrinex Digital Marketplace
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-20 relative overflow-hidden">
        {/* Decorative elements for mobile/right side */}
        <div className="lg:hidden absolute top-0 right-0 w-64 h-64 bg-[#1b6b3e]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff9900]/5 rounded-full blur-[100px] -ml-32 -mb-32"></div>

        <div className="w-full max-w-xl space-y-12 relative z-10">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-[#1b6b3e] transition-colors group mb-8 lg:hidden">
              <ArrowLeft size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Back to Home</span>
            </Link>
            <h2 className="text-4xl font-black text-[var(--foreground)] tracking-tighter">{title}</h2>
            <p className="text-gray-400 font-bold">{subtitle}</p>
          </div>

          <div className="bg-[var(--card)] p-1 md:p-2 rounded-[40px] border border-[var(--border)] shadow-2xl">
            <div className="bg-[var(--background)] p-8 md:p-10 rounded-[36px] border border-[var(--border)]">
              {children}
            </div>
          </div>

          {type !== "admin" && (
             <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Need Help? <Link href="#" className="text-[#1b6b3e] hover:underline">Contact Support</Link>
                </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
