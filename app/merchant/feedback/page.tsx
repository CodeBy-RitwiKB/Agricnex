"use client";
import React, { useState, useEffect } from "react";
import { MessageSquare, Star, Search, Reply, ThumbsUp, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MerchantFeedback() {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const res = await fetch("/api/merchants/feedback");
                const json = await res.json();
                if (json.success) {
                    setFeedbacks(json.data);
                } else {
                    setError(json.error || "Failed to load feedback.");
                }
            } catch (err) {
                setError("Failed to connect to backend server.");
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, []);

    const totalPages = Math.max(1, Math.ceil(feedbacks.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedFeedback = feedbacks.slice(startIndex, startIndex + itemsPerPage);

    const totalReviews = feedbacks.length;
    const avgRating = totalReviews > 0 
        ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalReviews).toFixed(1) 
        : "0.0";
    
    const positiveReviewsCount = feedbacks.filter(f => f.rating >= 4).length;
    const positivePercent = totalReviews > 0 
        ? `${Math.round((positiveReviewsCount / totalReviews) * 100)}%` 
        : "0%";

    // Split reviews into halves to calculate dynamic trend percentages
    const midPoint = Math.floor(totalReviews / 2);
    const recentReviews = feedbacks.slice(0, midPoint);
    const olderReviews = feedbacks.slice(midPoint);

    const recentPosRate = recentReviews.length > 0 
        ? recentReviews.filter(r => r.rating >= 4).length / recentReviews.length 
        : 0;
    const olderPosRate = olderReviews.length > 0 
        ? olderReviews.filter(r => r.rating >= 4).length / olderReviews.length 
        : 0;
    
    // Percentage growth in positive rating rate
    const posTrendVal = olderPosRate > 0 
        ? ((recentPosRate - olderPosRate) / olderPosRate) * 100 
        : (recentPosRate > 0 ? 100 : 0);

    // Volume growth comparing recent reviews count vs older reviews count
    const volTrendVal = olderReviews.length > 0 
        ? ((recentReviews.length - olderReviews.length) / olderReviews.length) * 100 
        : 0;

    const TrendBadge = ({ value }: { value: number }) => {
        if (value === 0) {
            return <span className="text-[9px] font-black text-gray-500 bg-gray-500/10 px-2 py-0.5 rounded-lg border border-gray-500/25">0.0%</span>;
        }
        const isPositive = value > 0;
        return (
            <span className={cn(
                "text-[9px] font-black px-2 py-0.5 rounded-lg border",
                isPositive 
                    ? "text-green-500 bg-green-500/10 border-green-500/20" 
                    : "text-red-500 bg-red-500/10 border-red-500/20"
            )}>
                {isPositive ? "+" : ""}{value.toFixed(1)}%
            </span>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">Store Feedback</h1>
                    <p className="text-xs font-bold text-gray-400">Manage reviews and engage with customer feedback.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-[var(--card)] border border-[var(--border)] px-4 py-2 rounded-2xl flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Avg Rating</span>
                        <div className="flex items-center gap-1 text-[#ff9900]">
                            <Star size={16} fill="currentColor" />
                            <span className="text-lg font-black">{avgRating}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Positive Reviews", value: positivePercent, trend: posTrendVal, color: "text-green-500", bgColor: "bg-green-500/10", icon: ThumbsUp },
                    { label: "New Reviews", value: totalReviews.toString(), trend: volTrendVal, color: "text-[#ff9900]", bgColor: "bg-[#ff9900]/10", icon: MessageSquare },
                    { label: "Pending Response", value: "0", trend: 0, color: "text-red-500", bgColor: "bg-red-500/10", icon: AlertCircle },
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-[40px] shadow-xl shadow-black/5 hover:border-[#ff9900]/30 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bgColor)}>
                                <stat.icon size={24} className={stat.color} />
                            </div>
                            <TrendBadge value={stat.trend} />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="animate-spin text-[#ff9900]" size={36} />
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading dynamic store reviews...</p>
                </div>
            ) : error ? (
                <div className="text-center py-16 border-2 border-dashed border-[var(--border)] rounded-[32px] p-6">
                    <p className="text-sm font-black uppercase tracking-wider text-red-500">⚠️ {error}</p>
                </div>
            ) : feedbacks.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-[var(--border)] rounded-[32px] p-6 text-gray-400">
                    <p className="text-xs font-black uppercase tracking-widest">No feedback found</p>
                </div>
            ) : (
                <>
                    {/* Feedback List */}
                    <div className="space-y-4">
                        {paginatedFeedback.map((item) => (
                            <div key={item.id} className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-[40px] shadow-xl shadow-black/5 hover:border-[#ff9900]/30 transition-all group animate-in fade-in duration-300">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 font-black text-sm">{item.initials}</div>
                                            <div>
                                                <h4 className="text-sm font-black uppercase tracking-tight"> {item.author}</h4>
                                                <div className="flex items-center gap-1 text-[#ff9900] mt-0.5">
                                                    {Array.from({ length: 5 }).map((_, s) => (
                                                        <Star key={s} size={10} fill={s < item.rating ? "currentColor" : "none"} className={s < item.rating ? "text-[#ff9900]" : "text-gray-300"} />
                                                    ))}
                                                    <span className="text-[9px] font-bold text-gray-400 ml-2">Verified Purchase • {item.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-[var(--background)] p-6 rounded-3xl border border-[var(--border)] italic text-sm text-gray-600 font-bold leading-relaxed">
                                            "{item.content}"
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Product: {item.product}</p>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-32 flex flex-row md:flex-col justify-between md:justify-start gap-4">
                                        <button className="flex-1 bg-green-500/10 text-green-500 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all">Feature</button>
                                        <button className="flex-1 bg-red-500/10 text-red-500 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Report</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between bg-[var(--card)] border border-[var(--border)] rounded-[24px] px-8 py-4 shadow-xl shadow-black/5 animate-in fade-in duration-300">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-6 py-3 border border-[var(--border)] rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-black dark:hover:border-white transition-all bg-[var(--card)]"
                            >
                                Previous
                            </button>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                Page <span className="text-[var(--foreground)]">{currentPage}</span> of <span className="text-[var(--foreground)]">{totalPages}</span>
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
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
