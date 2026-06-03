import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, User, Mic } from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";
import LanguageSelector from "@/components/common/LanguageSelector";
import { useSession } from "@/lib/auth-client";

const MerchantHeader = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = (dark: boolean) => {
    setIsDarkMode(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[var(--border)] transition-all duration-500">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-8">
          
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img 
                src="https://res.cloudinary.com/dhpvb2emj/image/upload/q_auto/f_auto/v1778241361/logo.png" 
                alt="Agrinex Logo" 
                className="h-7 w-auto object-contain select-none transition-transform group-hover:scale-105"
                onContextMenu={(e) => e.preventDefault()}
                draggable="false"
              />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-lg font-black tracking-tighter text-[#1b6b3e] uppercase">Agrinex</span>
              <p className="text-[6px] font-black text-gray-400 uppercase tracking-[0.4em] ml-0.5">Merchant Hub</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative group hidden md:block">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1b6b3e] transition-colors">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search your orders, listings or customers..." 
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[24px] py-4 pl-14 pr-16 text-sm font-bold focus:outline-none focus:border-[#1b6b3e] focus:ring-4 focus:ring-[#1b6b3e]/5 transition-all shadow-sm"
            />
            <div className="absolute inset-y-0 right-5 flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
                <Mic size={18} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <div className="w-px h-6 bg-[var(--border)] mx-2"></div>
            <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />
            <div className="w-px h-6 bg-[var(--border)] mx-2"></div>
            
            <Link href="/profile" className="flex items-center gap-3 bg-[var(--background)] border border-[var(--border)] hover:border-[#1b6b3e] px-5 py-2.5 rounded-full transition-all group">
              <div className="w-8 h-8 rounded-full bg-[#1b6b3e]/10 flex items-center justify-center text-[#1b6b3e] group-hover:bg-[#1b6b3e] group-hover:text-white transition-all overflow-hidden">
                {user?.image ? (
                  <img src={user.image} alt={user.name || "Profile"} className="w-full h-full object-cover" />
                ) : (
                  <User size={18} />
                )}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Merchant Hub</p>
                <p className="text-xs font-black text-[var(--foreground)] mt-1">{user?.name || "My Account"}</p>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
};

export default MerchantHeader;
