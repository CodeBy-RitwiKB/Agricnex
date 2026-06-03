"use client";
import React, { useState, useEffect } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, Flag, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminModeration() {
    const [queue, setQueue] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actioningId, setActioningId] = useState<string | null>(null);
    const [error, setError] = useState("");

    const fetchQueue = async () => {
        try {
            const res = await fetch("/api/admin/moderation");
            const json = await res.json();
            if (json.success) {
                setQueue(json.queue);
                setStats(json.stats);
            } else {
                setError(json.error || "Failed to load moderation items.");
            }
        } catch (err) {
            setError("Failed to connect to the administration API.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    const handleAction = async (action: "approve" | "reject", id: string, dbType: string) => {
        setActioningId(id);
        try {
            const res = await fetch("/api/admin/moderation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, id, dbType })
            });
            const json = await res.json();
            if (json.success) {
                // Refresh queue
                await fetchQueue();
            } else {
                alert(json.error || "Failed to submit decision.");
            }
        } catch (err) {
            alert("Network connection error. Please try again.");
        } finally {
            setActioningId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-48 gap-4">
                <Loader2 className="animate-spin text-cyan-500" size={48} />
                <p className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-white/40">Loading moderation index...</p>
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
                    <h1 className="text-4xl font-black tracking-tighter uppercase mb-1">Moderation Queue</h1>
                    <p className="text-xs font-bold text-gray-500 dark:text-white/40">Audit and enforce platform-wide quality and safety standards.</p>
                </div>
            </div>

            {/* Compliance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Pending Audit", val: stats?.pendingAudit?.toLocaleString() || "0", icon: ShieldCheck, color: "text-blue-500" },
                    { label: "Reported Items", val: stats?.reportedItems?.toLocaleString() || "0", icon: AlertTriangle, color: "text-red-500" },
                    { label: "Verified Sellers", val: stats?.verifiedSellers?.toLocaleString() || "0", icon: CheckCircle, color: "text-green-500" },
                    { label: "Auto-Blocked", val: stats?.autoBlocked?.toLocaleString() || "0", icon: XCircle, color: "text-red-900" },
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-3xl flex items-center gap-6 group hover:border-cyan-500/30 transition-all shadow-sm">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--input)] border border-[var(--border)]", stat.color)}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30 mb-1">{stat.label}</p>
                            <p className="text-xl font-black tracking-tighter text-[var(--foreground)]">{stat.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Moderation Items */}
            <div className="space-y-6">
                {queue.length === 0 ? (
                    <div className="text-center py-20 border border-[var(--border)] rounded-[40px] p-6 bg-[var(--card)] text-gray-400 dark:text-white/40 shadow-sm">
                        <CheckCircle size={36} className="mx-auto mb-4 text-green-500 animate-pulse" />
                        <p className="text-xs font-black uppercase tracking-widest">Compliance queue is empty. All clear!</p>
                    </div>
                ) : (
                    queue.map((item) => (
                        <div key={item.id} className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-[40px] hover:border-cyan-500/30 transition-all group shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between gap-8">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-3 h-3 rounded-full animate-pulse",
                                            item.priority === "Critical" ? "bg-red-500" : item.priority === "High" ? "bg-orange-500" : "bg-cyan-500"
                                        )}></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/40">{item.type}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-[var(--foreground)]">{item.entity}</h3>
                                        <p className="text-sm font-bold text-cyan-500 flex items-center gap-2">
                                            <Flag size={14} /> REASON: {item.reason}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {actioningId === item.id ? (
                                        <div className="flex items-center gap-2 px-6">
                                            <Loader2 className="animate-spin text-cyan-500" size={20} />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Processing...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={() => handleAction("reject", item.id, item.dbType)}
                                                className="px-6 py-3 rounded-2xl bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--border)] transition-all"
                                            >
                                                Dismiss
                                            </button>
                                            {item.dbType !== "review" && (
                                                <button 
                                                    onClick={() => handleAction("approve", item.id, item.dbType)}
                                                    className="px-6 py-3 rounded-2xl bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20"
                                                >
                                                    Verify / Approve
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
