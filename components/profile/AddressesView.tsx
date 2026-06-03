"use client";

import React from "react";
import { MapPin } from "lucide-react";

const AddressesView = () => {
  return (
    <div className="bg-[var(--card)] p-8 md:p-12 rounded-[48px] border border-[var(--border)] shadow-sm space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tighter flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#1b6b3e] rounded-full"></div>
          Store Locations
        </h3>
        <button className="text-[#1b6b3e] font-black text-xs uppercase tracking-widest hover:underline">+ Add New Warehouse</button>
      </div>

      <div className="space-y-4">
        <div className="p-8 rounded-[32px] border-2 border-[#1b6b3e] bg-[#1b6b3e]/5 flex items-start gap-6">
          <div className="w-12 h-12 rounded-2xl bg-[#1b6b3e] text-white flex items-center justify-center shadow-lg"><MapPin size={24} /></div>
          <div>
            <span className="text-[10px] font-black bg-[#1b6b3e] text-white px-2 py-0.5 rounded-md uppercase tracking-widest">Primary Store</span>
            <h4 className="text-lg font-black text-[var(--foreground)] mt-2">Agri-Hub Central Warehouse</h4>
            <p className="text-xs font-bold text-gray-500 mt-1">Gat No. 402, Near MIDC Phase 2, Chakan, Pune - 410501</p>
            <div className="mt-4 flex gap-4">
              <button className="text-[10px] font-black uppercase text-[#1b6b3e] hover:underline">Edit Location</button>
              <button className="text-[10px] font-black uppercase text-gray-400 hover:underline">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressesView;
