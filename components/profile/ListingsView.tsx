"use client";

import React from "react";

const ListingsView = () => {
  return (
    <div className="bg-[var(--card)] p-8 md:p-12 rounded-[48px] border border-[var(--border)] shadow-sm space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tighter flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#1b6b3e] rounded-full"></div>
          My Listings
        </h3>
        <button className="bg-[#1b6b3e] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#1b6b3e]/20 hover:scale-105 transition-all">
          + Add New Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: "Organic Fertilizers", price: 850, stock: 120, img: "🌱" },
          { name: "Hybrid Maize Seeds", price: 1200, stock: 45, img: "🌽" },
          { name: "Power Tiller X1", price: 45000, stock: 4, img: "🚜" },
          { name: "Drip Irrigation Kit", price: 2500, stock: 18, img: "💧" }
        ].map((p, i) => (
          <div key={i} className="p-6 rounded-[32px] border border-[var(--border)] bg-[var(--background)] flex items-center gap-6 group hover:shadow-xl transition-all">
            <div className="w-20 h-20 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">{p.img}</div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-[var(--foreground)] uppercase">{p.name}</h4>
              <p className="text-xs font-black text-[#1b6b3e]">₹{p.price.toLocaleString()}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: `${(p.stock / 150) * 100}%` }}></div>
                </div>
                <span className="text-[9px] font-black text-gray-400 uppercase">{p.stock} in stock</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListingsView;
