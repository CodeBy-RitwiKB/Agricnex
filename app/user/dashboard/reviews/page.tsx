"use client";
import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface Product {
  id: string;
  name: string;
  image_url?: string;
  tag?: string;
}

interface Review {
  id: string;
  product_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  products: Product;
}

export default function UserReviews() {
    const { data: session, isPending: sessionLoading } = useSession();
    const user = session?.user;

    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const fetchReviews = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`/api/user/reviews?userId=${user.id}`);
            const data = await res.json();
            if (data.success) {
                setReviews(data.reviews || []);
            }
        } catch (err) {
            console.error("Error fetching reviews:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [user?.id]);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleDelete = async (reviewId: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;
        try {
            const res = await fetch(`/api/user/reviews?reviewId=${reviewId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                setReviews(prev => prev.filter(r => r.id !== reviewId));
                showToast("Review deleted successfully!");
            }
        } catch (err) {
            console.error("Failed to delete review:", err);
        }
    };

    // Calculate Average Rating
    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "N/A";

    if (sessionLoading || loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-[#1b6b3e] animate-spin" />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading reviews...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {toastMessage && (
                <div className="fixed bottom-8 right-8 z-50 bg-[#1b6b3e] text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CheckCircle size={16} />
                    {toastMessage}
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">My Reviews</h1>
                    <p className="text-xs font-bold text-gray-400">Manage the feedback you've shared with the community.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-[var(--card)] border border-[var(--border)] px-4 py-2 rounded-2xl flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your Avg Rating</span>
                        <div className="flex items-center gap-1 text-[#ff9900]">
                            <Star size={16} fill="currentColor" />
                            <span className="text-lg font-black">{averageRating}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-20 text-center space-y-6">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-300">
                        <Star size={48} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter">No Reviews Yet</h3>
                        <p className="text-sm font-bold text-gray-400">Share your experience with products you've purchased.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-[40px] shadow-xl shadow-black/5 hover:border-[#1b6b3e]/30 transition-all group">
                            <div className="flex flex-col md:flex-row justify-between gap-8">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden border border-[var(--border)] flex items-center justify-center">
                                            <img 
                                                src={review.products?.image_url || "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?q=80&w=200&auto=format&fit=crop"} 
                                                alt="Product" 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-[#1b6b3e] uppercase tracking-widest mb-1">
                                                {review.products?.tag || "Fertilizer"}
                                            </p>
                                            <h3 className="text-sm font-black uppercase tracking-tight line-clamp-1">{review.products?.name}</h3>
                                            <div className="flex items-center gap-1 text-[#ff9900] mt-1">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star 
                                                        key={s} 
                                                        size={12} 
                                                        fill={s <= review.rating ? "currentColor" : "none"} 
                                                        className={s <= review.rating ? "text-[#ff9900]" : "text-gray-300"} 
                                                    />
                                                ))}
                                                <span className="text-[9px] font-bold text-gray-400 ml-2">
                                                    Published on {new Date(review.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[var(--background)] p-6 rounded-3xl border border-[var(--border)] italic text-sm text-gray-600 dark:text-gray-300 font-bold leading-relaxed relative">
                                        "{review.comment || 'No comment provided'}"
                                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#1b6b3e] text-white rounded-full flex items-center justify-center">
                                            <MessageSquare size={14} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                            <CheckCircle size={10} /> Verified Purchase
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-row md:flex-col gap-3 justify-center">
                                    <button 
                                        onClick={() => handleDelete(review.id)}
                                        className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-gray-400 hover:text-red-500 hover:border-red-500/30 transition-all group/btn"
                                    >
                                        <Trash2 size={18} className="group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
