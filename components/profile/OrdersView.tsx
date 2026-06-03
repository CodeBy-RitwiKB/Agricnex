"use client";

import React from "react";

const OrdersView = () => {
  return (
    <div className="bg-[var(--card)] p-8 md:p-12 rounded-[48px] border border-[var(--border)] shadow-sm space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tighter flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#1b6b3e] rounded-full"></div>
          Sales History
        </h3>
        <div className="flex gap-4">
          <button className="bg-[var(--background)] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[var(--border)] text-[#1b6b3e]">All Orders</button>
          <button className="bg-[var(--background)] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[var(--border)] text-gray-400">Pending</button>
        </div>
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-6 rounded-3xl border border-[var(--border)] flex items-center justify-between hover:bg-[var(--background)] transition-colors">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-[var(--background)] flex items-center justify-center font-black">#{8000 + i}</div>
              <div>
                <p className="text-sm font-black text-[var(--foreground)]">Order from Customer ID: {120 + i}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase">Processed on 12 May 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm font-black">₹{4500 + i * 200}</span>
              <button className="bg-[#1b6b3e]/10 text-[#1b6b3e] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1b6b3e] hover:text-white transition-all">Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersView;
