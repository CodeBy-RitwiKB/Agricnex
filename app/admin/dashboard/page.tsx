"use client";
import React, { useState, useEffect } from "react";
import { 
    Users, ShoppingBag, DollarSign, Activity, 
    TrendingUp, TrendingDown, ArrowRight, Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [activity, setActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch("/api/admin/stats");
                const json = await res.json();
                if (json.success) {
                    setStats(json.stats);
                    setActivity(json.activity);
                } else {
                    setError(json.error || "Failed to load system metrics.");
                }
            } catch (err) {
                setError("Failed to connect to administration API.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (val: number) => {
        if (val >= 10000000) {
            return `₹${(val / 10000000).toFixed(2)}Cr`;
        }
        if (val >= 100000) {
            return `₹${(val / 100000).toFixed(2)}L`;
        }
        return `₹${val.toLocaleString()}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-48 gap-4">
                <Loader2 className="animate-spin text-cyan-500" size={48} />
                <p className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-white/40">Aggregating system statistics...</p>
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 text-[var(--foreground)]">
            {/* System Status Hero (Stays dark for vibrant dashboard feel) */}
            <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-cyan-600 to-cyan-950 p-12 shadow-2xl shadow-cyan-900/40 text-white">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[140px] -mr-80 -mt-80"></div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">System Online</span>
                        </div>
                        <h1 className="text-6xl font-black tracking-tighter uppercase mb-6 leading-none text-white">Global <br /> Command</h1>
                        <p className="text-white/70 text-lg font-bold max-w-md leading-relaxed">
                            Agrinex infrastructure is operating at <span className="text-white font-black">99.98% efficiency</span>. All security protocols active.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: "Active Users", val: stats?.activeUsers?.toLocaleString() || "0", trend: "+12%" },
                            { label: "System Load", val: `${stats?.systemLoad}%`, trend: "Stable" },
                            { label: "Revenue", val: formatCurrency(stats?.revenue || 0), trend: "+8.4%" },
                            { label: "Incidents", val: String(stats?.incidents).padStart(2, '0'), trend: "Low" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl text-white">
                                <p className="text-[9px] font-black uppercase tracking-widest text-cyan-200 mb-1">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-black tracking-tighter text-white">{stat.val}</p>
                                    <span className="text-[8px] font-black text-green-400">{stat.trend}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "Total Revenue", val: formatCurrency(stats?.totalRevenue || 0), icon: DollarSign, trend: "+15.2%", up: true },
                    { label: "Orders Fulfilled", val: stats?.ordersFulfilled?.toLocaleString() || "0", icon: ShoppingBag, trend: "+4.1%", up: true },
                    { label: "New Registrations", val: stats?.newRegistrations?.toLocaleString() || "0", icon: Users, trend: "+2.4%", up: true },
                ].map((card, i) => (
                    <div key={i} className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-[40px] hover:border-cyan-500/30 transition-all duration-300 group shadow-sm hover:shadow-md">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-[var(--input)] border border-[var(--border)] flex items-center justify-center text-gray-400 dark:text-white/50 group-hover:text-cyan-500 transition-colors">
                                <card.icon size={28} />
                            </div>
                            <div className={cn(
                                "flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black",
                                card.up ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                            )}>
                                {card.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {card.trend}
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-[0.2em] mb-1">{card.label}</p>
                        <p className="text-3xl font-black tracking-tighter text-[var(--foreground)]">{card.val}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity Table */}
            <section className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-10 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                            <Activity size={24} />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-[var(--foreground)]">System Activity</h2>
                    </div>
                </div>

                <div className="overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.3em] border-b border-[var(--border)]">
                            <tr>
                                <th className="pb-6">User/Entity</th>
                                <th className="pb-6">Action</th>
                                <th className="pb-6">Timestamp</th>
                                <th className="pb-6">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {activity.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-xs font-black uppercase tracking-widest text-gray-400 dark:text-white/30">
                                        No recent system activity
                                    </td>
                                </tr>
                            ) : (
                                activity.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                        <td className="py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--input)] border border-[var(--border)] flex items-center justify-center font-black text-xs text-gray-500 dark:text-white/40">
                                                    {item.user.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black uppercase tracking-tight text-[var(--foreground)]">{item.user}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 dark:text-white/30 uppercase">ID: {item.userId.substring(0, 8).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]">{item.action}</p>
                                        </td>
                                        <td className="py-6 text-gray-400 dark:text-white/40 text-xs font-bold">
                                            {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="py-6">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                                item.status === "Success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                            )}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
