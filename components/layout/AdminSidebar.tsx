"use client";
import React from "react";
import { 
    Activity, Users, ShoppingBag, DollarSign, 
    ShieldCheck, Settings, ChevronRight, AlertTriangle 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const menuItems = [
    { icon: Activity, label: "Overview", href: "/admin/dashboard" },
    { icon: Users, label: "User Management", href: "/admin/dashboard/users" },
    { icon: ShoppingBag, label: "Total Orders", href: "/admin/dashboard/orders" },
    { icon: DollarSign, label: "Financials", href: "/admin/dashboard/financials" },
    { icon: ShieldCheck, label: "Moderation", href: "/admin/dashboard/moderation" },
    { icon: Settings, label: "System Config", href: "/admin/dashboard/config" },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-72 border-r border-[var(--border)] h-[calc(100vh-80px)] p-6 space-y-8 hidden lg:block bg-[var(--card)] transition-colors duration-500 sticky top-20">
            <div>
                <p className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-[0.3em] mb-4 ml-4">Main Menu</p>
                <nav className="space-y-1">
                    {menuItems.map((item, i) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link 
                                key={i}
                                href={item.href}
                                className={cn(
                                    "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                                    isActive ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "hover:bg-[var(--input)] text-gray-500 dark:text-white/50 hover:text-[var(--foreground)]"
                                )}
                            >
                                <item.icon size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="pt-8 border-t border-[var(--border)]">
                <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="text-cyan-500" size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Security Alert</span>
                    </div>
                    <p className="text-[9px] font-bold text-gray-500 dark:text-white/60 leading-relaxed mb-4">
                        Unrecognized login attempt from IP: 192.168.1.1. System security active.
                    </p>
                    <button className="w-full bg-[var(--input)] hover:bg-[var(--border)] text-[var(--foreground)] py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-colors border border-[var(--border)]">
                        Review Incident
                    </button>
                </div>
            </div>
        </aside>
    );
}
