"use client";
import React, { useState, useEffect } from "react";
import { ShoppingBag, Search, Filter, Truck, CheckCircle, Clock, AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch("/api/admin/orders");
                const json = await res.json();
                if (json.success) {
                    setOrders(json.orders);
                    setStats(json.stats);
                } else {
                    setError(json.error || "Failed to load platform orders.");
                }
            } catch (err) {
                setError("Failed to connect to the administration API.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const filteredOrders = orders.filter((o) => 
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-48 gap-4">
                <Loader2 className="animate-spin text-cyan-500" size={48} />
                <p className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-white/40">Fetching logistic feed...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-24 border border-[var(--border)] rounded-[40px] p-8 bg-[var(--card)] shadow-sm">
                <p className="text-base font-black uppercase tracking-wider text-red-500">⚠️ {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase mb-1">Global Fulfillment</h1>
                    <p className="text-xs font-bold text-gray-500 dark:text-white/40">Monitor and manage all transactions across the network.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30 group-focus-within:text-cyan-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search Order ID, Merchant, or Customer..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-cyan-500 transition-all w-96 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Global Order Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <section className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-8 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-white/40 mb-6 flex items-center gap-2">
                        <Clock size={16} className="text-blue-500" /> Pending Approval
                    </h3>
                    <p className="text-4xl font-black tracking-tighter mb-2 text-[var(--foreground)]">
                        {stats?.pendingApproval?.toLocaleString() || "0"}
                    </p>
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Requires System Audit</p>
                </section>
                <section className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-8 border-l-orange-500/30 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-white/40 mb-6 flex items-center gap-2">
                        <Truck size={16} className="text-orange-500" /> Global Transit
                    </h3>
                    <p className="text-4xl font-black tracking-tighter mb-2 text-[var(--foreground)]">
                        {stats?.globalTransit?.toLocaleString() || "0"}
                    </p>
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Live Logistic Feed</p>
                </section>
                <section className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-8 border-l-cyan-500/30 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-white/40 mb-6 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-cyan-500" /> Disputed Orders
                    </h3>
                    <p className="text-4xl font-black tracking-tighter mb-2 text-[var(--foreground)]">
                        {stats?.disputedOrders?.toLocaleString() || "0"}
                    </p>
                    <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Immediate Action Required</p>
                </section>
            </div>

            {/* Global Orders Table */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-[var(--input)] text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.3em] border-b border-[var(--border)]">
                        <tr>
                            <th className="px-8 py-6">Order ID</th>
                            <th className="px-8 py-6">Merchant</th>
                            <th className="px-8 py-6">Customer</th>
                            <th className="px-8 py-6">Amount</th>
                            <th className="px-8 py-6">Status</th>
                            <th className="px-8 py-6"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-8 py-16 text-center text-xs font-black uppercase tracking-widest text-gray-400 dark:text-white/30">
                                    No transaction logs found
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((o) => (
                                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black uppercase tracking-tight text-[var(--foreground)] group-hover:text-cyan-500 transition-colors">
                                            #{o.id.substring(0, 8).toUpperCase()}
                                        </p>
                                        <p className="text-[9px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest">
                                            {new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-500 dark:text-white/50 max-w-[200px] truncate">
                                        {o.merchant}
                                    </td>
                                    <td className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-500 dark:text-white/50">
                                        {o.customer}
                                    </td>
                                    <td className="px-8 py-6 font-black text-sm text-cyan-500">
                                        ₹{o.amount.toLocaleString()}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center w-fit gap-2",
                                            o.status === "delivered" 
                                                ? "bg-green-500/10 text-green-500" 
                                                : o.status === "cancelled"
                                                    ? "bg-red-500/10 text-red-500"
                                                    : "bg-blue-500/10 text-blue-500"
                                        )}>
                                            <div className={cn(
                                                "w-1 h-1 rounded-full",
                                                o.status === "delivered" ? "bg-green-500" : o.status === "cancelled" ? "bg-red-500" : "bg-blue-500 animate-pulse"
                                            )}></div> 
                                            {o.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button className="p-3 hover:bg-[var(--input)] rounded-xl transition-all text-gray-400 dark:text-white/30 hover:text-[var(--foreground)]">
                                            <ExternalLink size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
