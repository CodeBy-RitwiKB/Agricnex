"use client";
import React, { useState, useEffect } from "react";
import { Heart, ShoppingCart, Search, TrendingDown, Star, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  price: number | string;
  image_url?: string;
  unit: string;
}

interface WishlistItem {
  id: string;
  product_id: string;
  products: Product;
}

export default function UserWishlist() {
    const { data: session, isPending: sessionLoading } = useSession();
    const user = session?.user;
    const { addItem } = useCart();

    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const fetchWishlist = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`/api/user/wishlist?userId=${user.id}`);
            const data = await res.json();
            if (data.success) {
                setWishlistItems(data.items || []);
            }
        } catch (err) {
            console.error("Error fetching wishlist:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [user?.id]);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleRemove = async (productId: string) => {
        if (!user?.id) return;
        try {
            const res = await fetch(`/api/user/wishlist?userId=${user.id}&productId=${productId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
                showToast("Removed item from wishlist");
            }
        } catch (err) {
            console.error("Failed to remove item:", err);
        }
    };

    const handleAddToCart = (product: Product) => {
        addItem({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image_url: product.image_url || ""
        }, 1);
        showToast("Added item to cart!");
    };

    const filteredItems = wishlistItems.filter(item => 
        item.products?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sessionLoading || loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-[#1b6b3e] animate-spin" />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading wishlist...</p>
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
                    <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">My Wishlist</h1>
                    <p className="text-xs font-bold text-gray-400">Save your favorite products for future purchases.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1b6b3e] transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Find saved items..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl py-3 pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-[#1b6b3e] transition-all w-64 text-gray-700 dark:text-gray-100"
                        />
                    </div>
                </div>
            </div>

            {/* Wishlist Grid */}
            {filteredItems.length === 0 ? (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-20 text-center space-y-6">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-300">
                        <Heart size={48} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter">Your Wishlist is Empty</h3>
                        <p className="text-sm font-bold text-gray-400">Save products to wishlist to track pricing and availability.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredItems.map((item) => {
                        const product = item.products;
                        return (
                            <div key={item.id} className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-[40px] shadow-xl shadow-black/5 hover:border-[#1b6b3e]/30 transition-all group relative">
                                <button 
                                    onClick={() => handleRemove(product.id)}
                                    className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/80 backdrop-blur-md border border-[var(--border)] flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all z-10"
                                >
                                    <Heart size={18} fill="currentColor" />
                                </button>

                                <div className="aspect-square rounded-3xl bg-gray-100 dark:bg-gray-800 overflow-hidden mb-6 border border-[var(--border)] flex items-center justify-center">
                                    <img 
                                        src={product.image_url || "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?q=80&w=400&auto=format&fit=crop"} 
                                        alt={product.name} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center gap-1 text-[#ff9900] mb-1">
                                            <Star size={10} fill="currentColor" />
                                            <span className="text-[9px] font-black">4.8</span>
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-tight line-clamp-1">{product.name}</h3>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Unit: {product.unit}</p>
                                    </div>

                                    <div className="flex items-center justify-between py-4 border-y border-[var(--border)]">
                                        <div>
                                            <p className="text-lg font-black text-[#1b6b3e]">₹{Number(product.price).toLocaleString('en-IN')}</p>
                                            <div className="flex items-center gap-2 text-green-500 text-[8px] font-black uppercase">
                                                <TrendingDown size={10} /> Stable Price
                                            </div>
                                        </div>
                                        <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest">In Stock</span>
                                    </div>

                                    <button 
                                        onClick={() => handleAddToCart(product)}
                                        className="w-full flex items-center justify-center gap-2 bg-[#1b6b3e] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#145230] transition-all shadow-xl shadow-[#1b6b3e]/20"
                                    >
                                        <ShoppingCart size={14} /> Add to Cart
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
