"use client";

import React from "react";
import { Package, Zap, Star, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface OverviewViewProps {
  recentOrders: any[];
  setActiveTab: (tab: string) => void;
}

const OverviewView: React.FC<OverviewViewProps> = ({ recentOrders, setActiveTab }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Orders", value: "08", icon: <Package className="text-blue-500" /> },
          { label: "Products Listed", value: "42", icon: <Zap className="text-green-500" /> },
          { label: "Merchant Rating", value: "4.9", icon: <Star className="text-orange-500" fill="currentColor" /> }
        ].map((stat, i) => (
          <div key={i} className="bg-[var(--card)] p-8 rounded-[40px] border border-[var(--border)] shadow-sm group hover:border-[#1b6b3e]/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--background)] flex items-center justify-center group-hover:scale-110 transition-transform">{stat.icon}</div>
              <span className="text-3xl font-black text-[var(--foreground)]">{stat.value}</span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-[var(--card)] p-8 md:p-12 rounded-[48px] border border-[var(--border)] shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tighter flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#1b6b3e] rounded-full"></div>
            Sales Activity
          </h3>
          <button onClick={() => setActiveTab("orders")} className="text-[#1b6b3e] font-black text-xs uppercase tracking-widest hover:underline">View All Orders</button>
        </div>

        <div className="space-y-6">
          {recentOrders.map((order) => (
            <div key={order.id} className="group p-6 rounded-[32px] border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--card)] hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {order.image}
                </div>
                <div>
                  <p className="text-sm font-black text-[var(--foreground)] uppercase tracking-widest mb-1">{order.id}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">{order.date} • {order.items} Items</p>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-black text-[var(--foreground)]">₹{order.total.toLocaleString()}</p>
                  <p className="text-[9px] font-black text-[#1b6b3e] uppercase tracking-widest">Commission Paid</p>
                </div>
                <div className={cn(
                  "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border",
                  order.status === "Delivered" ? "bg-green-50 text-green-500 border-green-100" : "bg-blue-50 text-blue-500 border-blue-100"
                )}>
                  {order.status}
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-[#1b6b3e] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewView;
