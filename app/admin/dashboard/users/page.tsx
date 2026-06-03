"use client";
import React, { useState, useEffect } from "react";
import { Users, Search, Shield, MoreVertical, Mail, Trash2, Ban, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("/api/admin/users");
                const json = await res.json();
                if (json.success) {
                    setUsers(json.data);
                } else {
                    setError(json.error || "Failed to load users.");
                }
            } catch (err) {
                setError("Failed to connect to backend server.");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Compute dynamic stats
    const totalUsers = users.length;
    const merchantsCount = users.filter(u => u.role === "merchant").length;
    const customersCount = users.filter(u => u.role === "customer").length;
    const suspendedCount = users.filter(u => u.lockedUntil && new Date(u.lockedUntil) > new Date()).length;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase mb-1">User Ecosystem</h1>
                    <p className="text-xs font-bold text-gray-500 dark:text-white/40">Audit and manage all platform accounts across roles.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30 group-focus-within:text-cyan-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Find accounts..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-cyan-500 transition-all w-80 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Churn Legend Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-[var(--card)] border border-[var(--border)] px-6 py-3 rounded-2xl w-fit text-[9px] font-black uppercase tracking-widest shadow-sm">
                <span className="text-gray-500 dark:text-white/40">Churn Risk Legend:</span>
                <span className="flex items-center gap-1.5 text-green-500 bg-green-500/5 px-2 py-0.5 rounded-md border border-green-500/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Green for Safe (Low Risk)
                </span>
                <span className="flex items-center gap-1.5 text-orange-500 bg-orange-500/5 px-2 py-0.5 rounded-md border border-orange-500/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Orange for Medium Risk
                </span>
                <span className="flex items-center gap-1.5 text-red-500 bg-red-500/5 px-2 py-0.5 rounded-md border border-red-500/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Red for High Risk
                </span>
            </div>

            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Users", val: totalUsers.toLocaleString(), color: "text-[var(--foreground)]" },
                    { label: "Merchants", val: merchantsCount.toLocaleString(), color: "text-orange-500" },
                    { label: "Customers", val: customersCount.toLocaleString(), color: "text-[#1b6b3e]" },
                    { label: "Suspended", val: suspendedCount.toLocaleString(), color: "text-red-500" },
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-3xl text-center shadow-sm">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/30 mb-1">{stat.label}</p>
                        <p className={cn("text-2xl font-black tracking-tighter", stat.color)}>{stat.val}</p>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="animate-spin text-cyan-500" size={36} />
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-white/40">Loading platform accounts and computing churn metrics...</p>
                </div>
            ) : error ? (
                <div className="text-center py-16 border border-[var(--border)] rounded-[40px] p-6 bg-[var(--card)] shadow-sm">
                    <p className="text-sm font-black uppercase tracking-wider text-red-500">⚠️ {error}</p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-16 border border-[var(--border)] rounded-[40px] p-6 bg-[var(--card)] text-gray-400 dark:text-white/40 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-widest">No matching accounts found</p>
                </div>
            ) : (
                /* Users Table */
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--input)] text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.3em] border-b border-[var(--border)]">
                            <tr>
                                <th className="px-8 py-6">Identity</th>
                                <th className="px-8 py-6">Role</th>
                                <th className="px-8 py-6">Verified</th>
                                <th className="px-8 py-6">Cohort Segment</th>
                                <th className="px-8 py-6">Churn Risk</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {filteredUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-[var(--input)] flex items-center justify-center font-black text-sm text-gray-400 dark:text-white/30 border border-[var(--border)] group-hover:border-cyan-500/30 transition-all">
                                                {u.name ? u.name.substring(0, 2).toUpperCase() : "US"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-tight text-[var(--foreground)]">{u.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                            u.role === "merchant" 
                                                ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                                : u.role === "admin"
                                                    ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
                                                    : "bg-[#1b6b3e]/10 text-[#1b6b3e] border-[#1b6b3e]/20"
                                        )}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        {u.isVerified ? (
                                            <CheckCircle size={18} className="text-green-500" />
                                        ) : (
                                            <Ban size={18} className="text-gray-300 dark:text-white/20" />
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={cn(
                                            "text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
                                            u.cohort === "Champions" || u.cohort === "Loyal Customers" || u.cohort === "Loyal"
                                                ? "bg-green-500/10 text-green-500"
                                                : u.cohort === "At Risk" || u.cohort === "Hibernating"
                                                    ? "bg-red-500/10 text-red-500"
                                                    : u.cohort === "N/A"
                                                        ? "text-gray-400 dark:text-white/20 bg-transparent border border-[var(--border)]"
                                                        : "bg-blue-500/10 text-blue-500"
                                        )}>
                                            {u.cohort}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        {u.role === "customer" ? (
                                            <span className={cn(
                                                "inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md border whitespace-nowrap",
                                                u.churnRisk === "Safe"
                                                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                    : u.churnRisk === "Medium Risk"
                                                        ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                                        : "bg-red-500/10 text-red-500 border-red-500/20"
                                            )}>
                                                {u.churnRisk === "Safe" ? "Low Risk" : u.churnRisk} ({Math.round(u.churnScore * 100)}%)
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-gray-300 dark:text-white/20 font-bold uppercase">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            {u.lockedUntil && new Date(u.lockedUntil) > new Date() ? (
                                                <>
                                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-red-500">Suspended</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-green-500">Clear</span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-[var(--input)] rounded-xl transition-colors text-gray-400 dark:text-white/30 hover:text-cyan-500" title="Suspend"><Ban size={16} /></button>
                                            <button className="p-2 hover:bg-[var(--input)] rounded-xl transition-colors text-gray-400 dark:text-white/30 hover:text-[var(--foreground)]" title="Permit"><Shield size={16} /></button>
                                            <button className="p-2 hover:bg-[var(--input)] rounded-xl transition-colors text-gray-400 dark:text-white/30 hover:text-[var(--foreground)]" title="More"><MoreVertical size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

