"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Search, User, Mic, ChevronDown, Bell, LogOut, Settings, LayoutDashboard, ShoppingCart } from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";

const DashboardHeader = ({ type = "user" }: { type?: "user" | "merchant" | "admin" }) => {
    const router = useRouter();
    const { data: session } = useSession();
    const user = session?.user;
    const { isDarkMode, toggleTheme, cartCount } = useCart();
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowAccountMenu(false);
            }
        };
        if (showAccountMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showAccountMenu]);

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
        <header className="sticky top-0 z-[100] w-full bg-[var(--card)]/80 backdrop-blur-xl border-b border-[var(--border)] shadow-sm">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-8">
                
                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                    <div className="relative">
                        <img 
                            src="https://res.cloudinary.com/dhpvb2emj/image/upload/q_auto/f_auto/v1778241361/logo.png" 
                            alt="Agrinex Logo" 
                            className="h-9 w-auto object-contain select-none transition-transform group-hover:scale-105"
                        />
                    </div>
                    <div className="flex flex-col -space-y-1">
                        <span className="text-lg font-black tracking-tighter text-[#1b6b3e] uppercase">Agrinex</span>
                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-[0.4em] ml-0.5">
                            {type === "merchant" ? "Merchant Hub" : type === "admin" ? "Admin Portal" : "Customer Hub"}
                        </p>
                    </div>
                </Link>
 
                {/* Simplified Search Bar */}
                <div className="flex-1 max-w-2xl relative group hidden md:block">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1b6b3e] transition-colors">
                        <Search size={18} />
                    </div>
                    <input 
                        type="text" 
                        placeholder={type === "merchant" ? "Search orders, products or customers..." : "Search products, brands or orders..."} 
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-3 pl-14 pr-16 text-sm font-bold focus:outline-none focus:border-[#1b6b3e] transition-all shadow-sm"
                    />
                    <div className="absolute inset-y-0 right-5 flex items-center">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
                            <Mic size={16} />
                        </button>
                    </div>
                </div>
 
                {/* Dashboard Actions */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />
                        
                        {type === "user" && (
                            <Link href="/cart" className="w-10 h-10 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-gray-500 hover:text-[#1b6b3e] transition-all relative">
                                <ShoppingCart size={20} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#1b6b3e] text-white text-[10px] font-black border border-[var(--card)] shadow-lg animate-bounce">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        <button className="w-10 h-10 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-gray-500 hover:text-[#1b6b3e] transition-all relative">
                            <Bell size={20} />
                            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-[var(--card)]"></div>
                        </button>
                    </div>

                    <div className="w-px h-6 bg-[var(--border)] hidden sm:block"></div>

                    {/* Minimal Account Menu */}
                    <div className="relative" ref={menuRef}>
                        <div 
                            className="flex items-center gap-3 cursor-pointer hover:text-[#1b6b3e] transition-colors group"
                            onClick={() => setShowAccountMenu(!showAccountMenu)}
                        >
                            <div className="w-10 h-10 rounded-xl bg-[var(--background)] flex items-center justify-center group-hover:bg-[#1b6b3e]/10 border border-[var(--border)] transition-all overflow-hidden">
                                {user?.image ? (
                                    <img src={user.image} alt={user.name || "User Profile"} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-gray-500 group-hover:text-[#1b6b3e]" />
                                )}
                            </div>
                            <ChevronDown size={14} className={cn("text-gray-400 transition-transform duration-300 hidden sm:block", showAccountMenu && "rotate-180")} />
                        </div>

                        <AnimatePresence>
                            {showAccountMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full right-0 mt-4 w-64 bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl z-[150] overflow-hidden p-2 backdrop-blur-xl"
                                >
                                    <div className="p-4 border-b border-[var(--border)] mb-2">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Access</p>
                                        <p className="text-xs font-bold text-[var(--foreground)] truncate">{user?.name || "Store Manager"}</p>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group">
                                            <LayoutDashboard size={16} className="text-gray-400 group-hover:text-[#1b6b3e]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
                                        </Link>
                                        <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group">
                                            <Settings size={16} className="text-gray-400 group-hover:text-[#1b6b3e]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
                                        </Link>
                                        <div className="h-px bg-[var(--border)] my-2" />
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-500/10 text-red-500 transition-all group"
                                        >
                                            <LogOut size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
