"use client";

import React from "react";

const SettingsView = () => {
  return (
    <div className="bg-[var(--card)] p-8 md:p-12 rounded-[48px] border border-[var(--border)] shadow-sm space-y-12">
      <h3 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tighter flex items-center gap-3">
        <div className="w-1.5 h-6 bg-[#1b6b3e] rounded-full"></div>
        Account Settings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Name</label>
            <input type="text" defaultValue="Ramesh Kumar Agri-Ventures" className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-[#1b6b3e] transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Merchant Email</label>
            <input type="email" defaultValue="ramesh.kumar@agrinex.com" className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-[#1b6b3e] transition-all" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PAN / GST Details</label>
            <input type="text" defaultValue="ABCDE1234F" className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-[#1b6b3e] transition-all uppercase" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Store Category</label>
            <select className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-[#1b6b3e] transition-all appearance-none">
              <option>General Merchant</option>
              <option>Seed Specialist</option>
              <option>Machinery Dealer</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-[var(--border)] flex justify-end">
        <button className="bg-[#1b6b3e] text-white px-10 py-5 rounded-[24px] font-black uppercase tracking-widest text-sm shadow-2xl shadow-[#1b6b3e]/30 hover:scale-105 active:scale-95 transition-all">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
