"use client";
import React, { useState, useEffect } from "react";
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Wallet, Receipt, CreditCard, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminFinancials() {
    const [stats, setStats] = useState<any>(null);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchFinancials = async () => {
            try {
                const res = await fetch("/api/admin/financials");
                const json = await res.json();
                if (json.success) {
                    setStats(json.stats);
                    setAuditLogs(json.auditLogs);
                } else {
                    setError(json.error || "Failed to load platform financials.");
                }
            } catch (err) {
                setError("Failed to connect to the administration API.");
            } finally {
                setLoading(false);
            }
        };

        fetchFinancials();
    }, []);

    const formatCurrency = (val: number) => {
        return `₹${val.toLocaleString([], { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-48 gap-4">
                <Loader2 className="animate-spin text-cyan-500" size={48} />
                <p className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-white/40">Loading platform treasury data...</p>
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase mb-1">Fiscal Command</h1>
                    <p className="text-xs font-bold text-gray-500 dark:text-white/40">Real-time auditing of platform-wide capital and tax flow.</p>
                </div>
                <button className="bg-cyan-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-cyan-600 transition-all shadow-xl shadow-cyan-500/20">
                    <Download size={18} /> Financial Export
                </button>
            </div>

            {/* Global Revenue Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Net Revenue", val: formatCurrency(stats?.netRevenue || 0), trend: "+12.4%", up: true },
                    { label: "Merchant Payouts", val: formatCurrency(stats?.merchantPayouts || 0), trend: "+8.1%", up: true },
                    { label: "Platform Comm.", val: formatCurrency(stats?.platformCommission || 0), trend: "+15.2%", up: true },
                    { label: "Tax Liability", val: formatCurrency(stats?.taxLiability || 0), trend: "-2.4%", up: false },
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-[40px] group hover:border-cyan-500/30 transition-all shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-white/30 mb-2">{stat.label}</p>
                        <p className="text-xl font-black tracking-tighter mb-4 text-[var(--foreground)] truncate">{stat.val}</p>
                        <div className={cn(
                             "flex items-center gap-1 text-[10px] font-black uppercase",
                             stat.up ? "text-green-500" : "text-red-500"
                        )}>
                            {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {stat.trend}
                        </div>
                    </div>
                ))}
            </div>

            {/* Transaction Audit Log */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <section className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-10 shadow-sm">
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-10 flex items-center gap-3 text-[var(--foreground)]">
                        <Receipt className="text-cyan-500" size={24} /> Recent Audit Log
                    </h3>
                    <div className="space-y-6">
                        {auditLogs.length === 0 ? (
                            <p className="text-center py-12 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-white/30">
                                No settled payout logs
                            </p>
                        ) : (
                            auditLogs.map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-6 rounded-3xl bg-[var(--input)] border border-[var(--border)] hover:border-cyan-500/30 transition-all group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-gray-400 dark:text-white/30 group-hover:text-cyan-500 transition-colors">
                                            <Wallet size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-tight text-[var(--foreground)]">Merchant Payout #{log.id.substring(0, 6).toUpperCase()}</p>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest">
                                                Method: {log.bank} • {new Date(log.timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-cyan-500 mb-1">-{formatCurrency(log.amount)}</p>
                                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest">{log.status}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-10 shadow-sm">
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-10 flex items-center gap-3 text-[var(--foreground)]">
                        <CreditCard className="text-cyan-500" size={24} /> Platform Reserve
                    </h3>
                    <div className="p-8 rounded-[32px] bg-gradient-to-br from-cyan-600/20 to-transparent border border-cyan-500/20 mb-8 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-2">Current Liquidity</p>
                        <p className="text-4xl font-black tracking-tighter text-[var(--foreground)] truncate">{formatCurrency(stats?.reserve || 0)}</p>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30 mb-4">Quick Payout Status</p>
                        <div className="flex justify-between items-center text-xs font-black uppercase">
                            <span className="text-gray-500 dark:text-white/50">Merchant Pool</span>
                            <span className="text-[var(--foreground)]">92%</span>
                        </div>
                        <div className="h-2 w-full bg-[var(--input)] border border-[var(--border)] rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 w-[92%]"></div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
