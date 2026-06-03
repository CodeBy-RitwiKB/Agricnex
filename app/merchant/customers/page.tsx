"use client";
import React, { useState, useEffect } from "react";
import { Users, Search, MessageSquare, Star, Mail, Phone, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MerchantCustomers() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await fetch("/api/merchants/customers");
                const json = await res.json();
                if (json.success) {
                    setCustomers(json.data);
                } else {
                    setError(json.error || "Failed to load customers.");
                }
            } catch (err) {
                setError("Failed to connect to backend server.");
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Reset page when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">Your Customers</h1>
                    <p className="text-xs font-bold text-gray-400">Understand and engage with your farming community.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff9900] transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Find customers..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl py-3 pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-[#ff9900] transition-all w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Churn Legend Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-[var(--card)] border border-[var(--border)] px-6 py-3 rounded-2xl w-fit text-[9px] font-black uppercase tracking-widest shadow-sm">
                <span className="text-gray-400">Churn Risk Legend:</span>
                <span className="flex items-center gap-1.5 text-green-500 bg-green-500/5 px-2 py-0.5 rounded-md border border-green-500/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Low Risk
                </span>
                <span className="flex items-center gap-1.5 text-orange-500 bg-orange-500/5 px-2 py-0.5 rounded-md border border-orange-500/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Medium Risk
                </span>
                <span className="flex items-center gap-1.5 text-red-500 bg-red-500/5 px-2 py-0.5 rounded-md border border-red-500/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> High Risk
                </span>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="animate-spin text-[#ff9900]" size={36} />
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Analyzing customer cohorts & churn profiles...</p>
                </div>
            ) : error ? (
                <div className="text-center py-16 border-2 border-dashed border-[var(--border)] rounded-[32px] p-6">
                    <p className="text-sm font-black uppercase tracking-wider text-red-500">⚠️ {error}</p>
                </div>
            ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-[var(--border)] rounded-[32px] p-6 text-gray-400">
                    <p className="text-xs font-black uppercase tracking-widest">No customers found</p>
                </div>
            ) : (
                <>
                    {/* Customers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {paginatedCustomers.map((customer) => (
                            <div key={customer.id} className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-[40px] shadow-xl shadow-black/5 hover:border-[#ff9900]/30 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[360px]">
                                {/* Churn warning top banner if High Risk */}
                                {customer.churnRisk === "High Risk" && (
                                    <div className="absolute top-0 left-0 right-0 bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-[0.2em] py-2 px-4 flex items-center gap-2">
                                        <AlertTriangle size={10} /> Churn Risk: High ({Math.round(customer.churnScore * 100)}%)
                                    </div>
                                )}
                                {customer.churnRisk === "Medium Risk" && (
                                    <div className="absolute top-0 left-0 right-0 bg-orange-500/10 text-orange-500 text-[8px] font-black uppercase tracking-[0.2em] py-2 px-4 flex items-center gap-2">
                                        <AlertTriangle size={10} /> Churn Risk: Medium ({Math.round(customer.churnScore * 100)}%)
                                    </div>
                                )}

                                <div className="flex items-start justify-between mb-6 mt-4">
                                    <div className="w-20 h-20 rounded-3xl bg-gray-100 overflow-hidden border-2 border-white transition-transform group-hover:scale-110 flex items-center justify-center">
                                        <img 
                                            src={customer.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=ff9900&color=fff`} 
                                            alt="Customer" 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1 text-orange-500 mb-1">
                                            <Star size={12} fill="currentColor" />
                                            <span className="text-[10px] font-black">
                                                {customer.totalOrders > 10 ? "5.0" : "4.8"}
                                            </span>
                                        </div>
                                        <span className={cn(
                                            "text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
                                            customer.cohort === "Champions" || customer.cohort === "Loyal Customers" || customer.cohort === "Loyal"
                                                ? "bg-green-500/10 text-green-500"
                                                : customer.cohort === "At Risk" || customer.cohort === "Hibernating"
                                                    ? "bg-red-500/10 text-red-500"
                                                    : "bg-blue-500/10 text-blue-500"
                                        )}>
                                            {customer.cohort}
                                        </span>
                                        <span className={cn(
                                            "text-[7px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md mt-1.5 border block w-fit ml-auto",
                                            customer.churnRisk === "Safe"
                                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                : customer.churnRisk === "Medium Risk"
                                                    ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                                    : "bg-red-500/10 text-red-500 border-red-500/20"
                                        )}>
                                            {customer.churnRisk === "Safe" ? "Low Risk" : customer.churnRisk}: {Math.round(customer.churnScore * 100)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight line-clamp-1">{customer.name}</h3>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest line-clamp-1">{customer.email}</p>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Member for {customer.tenureDays} days</p>
                                    </div>

                                    <div className="flex items-center gap-4 py-4 border-y border-[var(--border)]">
                                        <div className="flex-1 text-center">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Orders</p>
                                            <p className="text-sm font-black">{customer.totalOrders}</p>
                                        </div>
                                        <div className="w-px h-6 bg-[var(--border)]" />
                                        <div className="flex-1 text-center">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Spent</p>
                                            <p className="text-sm font-black">₹{customer.totalSpent.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <a href={`mailto:${customer.email}`} className="flex items-center justify-center gap-2 py-3 w-full rounded-xl bg-[var(--background)] border border-[var(--border)] hover:border-[#ff9900]/30 transition-all text-gray-500 hover:text-[#ff9900]">
                                            <Mail size={14} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Email</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between bg-[var(--card)] border border-[var(--border)] rounded-[24px] px-8 py-4 shadow-xl shadow-black/5 animate-in fade-in duration-300 mt-8">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1 || loading}
                                className="px-6 py-3 border border-[var(--border)] rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-black dark:hover:border-white transition-all bg-[var(--card)]"
                            >
                                Previous
                            </button>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                Page <span className="text-[var(--foreground)]">{currentPage}</span> of <span className="text-[var(--foreground)]">{totalPages}</span>
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || loading}
                                className="px-6 py-3 border border-[var(--border)] rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-black dark:hover:border-white transition-all bg-[var(--card)]"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
