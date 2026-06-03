"use client";
import React from "react";
import { 
    LayoutDashboard, ShoppingBag, Heart, CreditCard, 
    Settings, LogOut, ChevronRight, Bell, Star
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";

const menuItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/user/dashboard" },
    { icon: ShoppingBag, label: "My Orders", href: "/user/dashboard/orders" },
    { icon: Heart, label: "Wishlist", href: "/user/dashboard/wishlist" },
    { icon: CreditCard, label: "Payments", href: "/user/dashboard/payments" },
    { icon: Star, label: "My Reviews", href: "/user/dashboard/reviews" },
    { icon: Settings, label: "Settings", href: "/user/dashboard/settings" },
];

export default function UserSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut();
            router.push("/");
        } catch (error) {
            console.error("Error logging out:", error);
            window.location.href = "/";
        }
    };

    return (
        <aside className="w-full lg:w-72 space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-4">Account Menu</p>
            {menuItems.map((item, i) => {
                const isActive = pathname === item.href;
                return (
                    <Link 
                        key={i}
                        href={item.href}
                        className={cn(
                            "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group",
                            isActive ? "bg-[#1b6b3e] text-white shadow-xl shadow-[#1b6b3e]/20" : "hover:bg-[var(--card)] text-gray-500 hover:text-[var(--foreground)]"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                                isActive ? "bg-white/20" : "bg-[var(--background)] group-hover:bg-[#1b6b3e]/10"
                            )}>
                                <item.icon size={16} className={cn(isActive && "text-white")} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                        </div>
                        <ChevronRight size={14} className={cn("transition-transform group-hover:translate-x-1", isActive ? "text-white" : "text-gray-400")} />
                    </Link>
                );
            })}
            <div className="pt-4 border-t border-[var(--border)] mt-4">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all"
                >
                    <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <LogOut size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                </button>
            </div>
        </aside>
    );
}
