"use client";
import React, { useState } from "react";
import { Zap, Plus, Search, Tag, Megaphone, Target, BarChart3, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MerchantMarketing() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [campaigns, setCampaigns] = useState([
        { name: "Kharif Season Sale", type: "Discount Coupons", reach: "12,450", conversions: "856", status: "Active", budget: "₹15,000" },
        { name: "Premium Urea Promo", type: "Featured Listings", reach: "4,200", conversions: "312", status: "Active", budget: "₹5,000" },
    ]);
    const [newCampaign, setNewCampaign] = useState({
        name: "",
        type: "Discount Coupons",
        budget: ""
    });

    const openWithMode = (type: string) => {
        setNewCampaign({ name: "", type, budget: "" });
        setIsModalOpen(true);
    };

    const handleCreateCampaign = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCampaign.name || !newCampaign.budget) {
            alert("Please fill in all campaign fields.");
            return;
        }

        setCampaigns([
            ...campaigns,
            {
                name: newCampaign.name,
                type: newCampaign.type,
                reach: "0",
                conversions: "0",
                status: "Active",
                budget: "₹" + Number(newCampaign.budget).toLocaleString()
            }
        ]);
        setIsModalOpen(false);
        setNewCampaign({ name: "", type: "Discount Coupons", budget: "" });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">Marketing Hub</h1>
                    <p className="text-xs font-bold text-gray-400">Launch campaigns and boost your store's visibility.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => openWithMode("Discount Coupons")}
                        className="bg-[#ff9900] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 group"
                    >
                        <Plus size={18} className="transition-transform group-hover:rotate-90" />
                        Create Campaign
                    </button>
                </div>
            </div>

            {/* Marketing Tools */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: "Discount Coupons", desc: "Create promo codes for your products.", icon: Tag, color: "text-[#ff9900]", bgColor: "bg-[#ff9900]/10" },
                    { title: "Featured Listings", desc: "Get your products on the front page.", icon: Megaphone, color: "text-blue-500", bgColor: "bg-blue-500/10" },
                    { title: "Audience Targeting", desc: "Reach specific groups of farmers.", icon: Target, color: "text-[#1b6b3e]", bgColor: "bg-[#1b6b3e]/10" },
                ].map((tool, i) => (
                    <div key={i} className="bg-[var(--card)] border border-[var(--border)] p-10 rounded-[40px] shadow-xl shadow-black/5 hover:border-[#ff9900]/30 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 dark:bg-gray-800 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-50/10 transition-colors"></div>
                        <div className="relative z-10">
                            <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform", tool.bgColor)}>
                                <tool.icon size={32} className={tool.color} />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-2">{tool.title}</h3>
                            <p className="text-xs font-bold text-gray-400 leading-relaxed mb-8">{tool.desc}</p>
                            <button 
                                onClick={() => openWithMode(tool.title)}
                                className="text-[10px] font-black uppercase tracking-widest text-[#ff9900] flex items-center gap-2 group/btn"
                            >
                                Launch Tool <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Active Campaigns */}
            <section className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-8 shadow-xl shadow-black/5">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <BarChart3 size={24} />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tighter">Active Campaigns</h2>
                    </div>
                </div>

                <div className="space-y-4">
                    {campaigns.map((campaign, i) => (
                        <div key={i} className="p-8 rounded-[32px] bg-[var(--background)] border border-[var(--border)] hover:border-[#ff9900]/30 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black uppercase tracking-tight">{campaign.name}</h4>
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Running
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 text-[#ff9900] text-[8px] font-black uppercase tracking-widest">{campaign.type}</span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Budget: {campaign.budget}</span>
                                    </div>
                                </div>
                                <div className="flex gap-8">
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Reach</p>
                                        <p className="text-lg font-black tracking-tighter">{campaign.reach}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Conversions</p>
                                        <p className="text-lg font-black tracking-tighter">{campaign.conversions}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">ROI</p>
                                        <p className="text-lg font-black tracking-tighter text-green-500">4.2x</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Create Campaign Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] w-full max-w-lg p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
                            <h3 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)]">New Campaign</h3>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-black dark:hover:text-white font-bold text-base transition-all">✕</button>
                        </div>
                        
                        <form onSubmit={handleCreateCampaign} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Campaign Name *</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={newCampaign.name}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                    placeholder="e.g. Monsoon Organic Discount"
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-[#ff9900] text-[var(--foreground)]"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Campaign Type *</label>
                                <select 
                                    value={newCampaign.type}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value })}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-[#ff9900] text-[var(--foreground)] transition-all cursor-pointer"
                                >
                                    <option value="Discount Coupons">Discount Coupons</option>
                                    <option value="Featured Listings">Featured Listings</option>
                                    <option value="Audience Targeting">Audience Targeting</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Budget (INR) *</label>
                                <input 
                                    type="number" 
                                    required 
                                    value={newCampaign.budget}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, budget: e.target.value })}
                                    placeholder="e.g. 10000"
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-[#ff9900] text-[var(--foreground)]"
                                />
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-[var(--border)]">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-[var(--card)] border border-[var(--border)] text-gray-500 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 bg-[#ff9900] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all"
                                >
                                    Launch Campaign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
