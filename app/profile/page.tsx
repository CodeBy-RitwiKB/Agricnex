"use client";

import React, { useState } from "react";
import MerchantHeader from "@/components/layout/MerchantHeader";
import Footer from "@/components/layout/Footer";
import { 
  User, Package, MapPin, Heart, 
  Settings, LogOut, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

// Sub-components
import OverviewView from "@/components/profile/OverviewView";
import OrdersView from "@/components/profile/OrdersView";
import ListingsView from "@/components/profile/ListingsView";
import AddressesView from "@/components/profile/AddressesView";
import SettingsView from "@/components/profile/SettingsView";

const ProfilePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
      window.location.href = "/";
    }
  };

  const recentOrders = [
    { id: "ORD-9821", date: "10 May 2026", status: "In Transit", total: 1129, items: 1, image: "🧪" },
    { id: "ORD-8742", date: "02 May 2026", status: "Delivered", total: 2450, items: 3, image: "🚜" },
  ];

  const sidebarItems = [
    { id: "overview", label: "My Overview", icon: <User size={20} /> },
    { id: "orders", label: "My Orders", icon: <Package size={20} /> },
    { id: "saved", label: "My Listings", icon: <Zap size={20} /> },
    { id: "addresses", label: "Addresses", icon: <MapPin size={20} /> },
    { id: "settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="bg-[#fcfcfc] dark:bg-[#0a0a0a] min-h-screen transition-colors duration-500">
      <MerchantHeader />
      
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-[var(--card)] p-8 rounded-[40px] border border-[var(--border)] shadow-sm text-center">
              <div className="w-24 h-24 rounded-[32px] bg-[var(--background)] border-2 border-[#1b6b3e] flex items-center justify-center mx-auto mb-6 relative group cursor-pointer">
                <span className="text-4xl font-black text-[#1b6b3e]">R</span>
                <div className="absolute inset-0 bg-black/40 rounded-[32px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Settings className="text-white" size={24} />
                </div>
              </div>
              <h2 className="text-xl font-black text-[var(--foreground)] uppercase tracking-tighter">Ramesh Kumar</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Verified Merchant</p>
              
              <div className="mt-8 flex items-center justify-center gap-2 bg-green-50 dark:bg-green-950/20 py-2 rounded-full border border-green-100 dark:border-green-900/30">
                <Zap size={14} className="text-[#1b6b3e]" fill="currentColor" />
                <span className="text-[10px] font-black text-[#1b6b3e] uppercase">Level 4 Merchant</span>
              </div>
            </div>

            <nav className="bg-[var(--card)] p-4 rounded-[40px] border border-[var(--border)] shadow-sm">
                <div className="space-y-2">
                    {sidebarItems.map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center gap-4 px-6 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all",
                                activeTab === item.id 
                                    ? "bg-[#1b6b3e] text-white shadow-lg shadow-[#1b6b3e]/20" 
                                    : "text-gray-400 hover:text-[#1b6b3e] hover:bg-[var(--background)]"
                            )}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl font-black text-xs uppercase tracking-widest text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all mt-4 border-t border-[var(--border)] pt-8"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {activeTab === "overview" && <OverviewView recentOrders={recentOrders} setActiveTab={setActiveTab} />}
            {activeTab === "orders" && <OrdersView />}
            {activeTab === "saved" && <ListingsView />}
            {activeTab === "addresses" && <AddressesView />}
            {activeTab === "settings" && <SettingsView />}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
