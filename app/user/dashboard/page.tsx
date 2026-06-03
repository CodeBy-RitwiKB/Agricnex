"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Package, Heart, ShoppingBag, Clock, ChevronRight, Award, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number | string;
  image_url?: string;
  unit: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price_at_purchase: number | string;
  products?: Product;
}

interface Order {
  id: string;
  total_amount: number | string;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

export default function UserDashboard() {
    const { data: session, isPending: sessionLoading } = useSession();
    const user = session?.user;

    const [orders, setOrders] = useState<Order[]>([]);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        const fetchData = async () => {
            try {
                // Fetch orders
                const ordersRes = await fetch(`/api/checkout/order?userId=${user.id}`);
                const ordersData = await ordersRes.json();
                if (ordersData.success) {
                    setOrders(ordersData.orders || []);
                }

                // Fetch wishlist items
                const wishlistRes = await fetch(`/api/user/wishlist?userId=${user.id}`);
                const wishlistData = await wishlistRes.json();
                if (wishlistData.success) {
                    setWishlistCount(wishlistData.items?.length || 0);
                }
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.id]);

    // Derived statistics
    const totalSpent = orders.reduce((acc, order) => acc + Number(order.total_amount), 0);
    const activeOrders = orders.filter(order => ["pending", "processing", "shipped"].includes(order.status.toLowerCase())).length;
    const loyaltyPoints = Math.round(totalSpent * 0.15); // 15% of total spent
    const savings = Math.round(totalSpent * 0.10); // 10% of total spent as estimated savings

    if (sessionLoading || loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-[#1b6b3e] animate-spin" />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading dashboard...</p>
            </div>
        );
    }

    // Get the most recent 3 items purchased (from the order items)
    const recentItems: { productName: string; orderDate: string; price: number; status: string; imageUrl?: string; orderId: string }[] = [];
    orders.slice(0, 3).forEach(order => {
        if (order.order_items && order.order_items.length > 0) {
            const firstItem = order.order_items[0];
            if (firstItem.products) {
                recentItems.push({
                    productName: firstItem.products.name,
                    orderDate: new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }),
                    price: Number(firstItem.price_at_purchase) * firstItem.quantity,
                    status: order.status,
                    imageUrl: firstItem.products.image_url,
                    orderId: order.id
                });
            }
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Immersive User Hero Section */}
            <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-[#1b6b3e] to-[#145230] p-12 text-white shadow-2xl shadow-[#1b6b3e]/20">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-32 h-32 rounded-[32px] bg-white/20 backdrop-blur-xl border-2 border-white/30 flex items-center justify-center overflow-hidden transition-transform duration-500 hover:scale-110">
                        <img 
                            src={user?.image || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=1b6b3e&color=fff`} 
                            alt={user?.name || "User"}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <h1 className="text-4xl font-black tracking-tighter uppercase">Welcome back, {user?.name?.split(' ')[0] || 'Farmer'}!</h1>
                            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[9px] font-black uppercase tracking-widest border border-white/20 flex items-center gap-2">
                                <Award size={12} /> {loyaltyPoints > 1000 ? "GOLD MEMBER" : loyaltyPoints > 500 ? "SILVER MEMBER" : "BRONZE MEMBER"}
                            </span>
                        </div>
                        <p className="text-white/80 font-bold text-lg mb-6 max-w-xl leading-relaxed">
                            Your farm is thriving. You've earned <span className="text-white font-black">{loyaltyPoints.toLocaleString('en-IN')} loyalty points</span> this season.
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Active Orders</p>
                                <p className="text-xl font-black">{activeOrders.toString().padStart(2, '0')}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Savings</p>
                                <p className="text-xl font-black">₹{savings.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "My Orders", value: `${orders.length} Purchases`, icon: ShoppingBag, color: "text-[#1b6b3e]", bg: "bg-[#1b6b3e]/10", link: "/user/dashboard/orders" },
                    { label: "Wishlist", value: `${wishlistCount} Items Saved`, icon: Heart, color: "text-red-500", bg: "bg-red-500/10", link: "/user/dashboard/wishlist" },
                    { label: "Loyalty Club", value: `${loyaltyPoints} Points Active`, icon: Award, color: "text-[#ff9900]", bg: "bg-[#ff9900]/10", link: "#" },
                ].map((card, i) => (
                    <Link href={card.link} key={i} className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-[40px] shadow-xl shadow-black/5 hover:scale-[1.02] transition-all group block">
                        <div className="flex items-center gap-6">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform", card.bg)}>
                                <card.icon size={28} className={card.color} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
                                <p className="text-lg font-black tracking-tight">{card.value}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Recent Orders Section */}
            <section className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-8 shadow-xl shadow-black/5">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#1b6b3e]/10 flex items-center justify-center text-[#1b6b3e]">
                            <Package size={24} />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tighter">Recent Purchases</h2>
                    </div>
                    <Link href="/user/dashboard/orders" className="text-[10px] font-black text-[#1b6b3e] uppercase tracking-widest hover:underline">View All Orders</Link>
                </div>

                <div className="space-y-4">
                    {recentItems.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-[var(--border)] rounded-3xl">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">No recent purchases found</p>
                            <Link href="/store" className="px-6 py-3 rounded-2xl bg-[#1b6b3e] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#145230] transition-all">Start Shopping</Link>
                        </div>
                    ) : (
                        recentItems.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-6 rounded-3xl bg-[var(--background)] border border-[var(--border)] hover:border-[#1b6b3e]/30 transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden border border-[var(--border)] flex items-center justify-center">
                                        <img src={item.imageUrl || "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?q=80&w=200&auto=format&fit=crop"} alt={item.productName} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tight line-clamp-1 max-w-[200px] md:max-w-xs">{item.productName}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <Clock size={12} /> Ordered on {item.orderDate}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-8">
                                    <div>
                                        <p className="text-sm font-black text-[#1b6b3e] mb-1">₹{item.price.toLocaleString('en-IN')}</p>
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                            item.status.toLowerCase() === "delivered" ? "bg-green-500/10 text-green-500" :
                                            item.status.toLowerCase() === "cancelled" ? "bg-red-500/10 text-red-500" :
                                            "bg-orange-500/10 text-orange-500"
                                        )}>{item.status}</span>
                                    </div>
                                    <Link href="/user/dashboard/orders" className="p-3 hover:bg-[#1b6b3e]/10 rounded-xl transition-all text-gray-400 hover:text-[#1b6b3e]">
                                        <ChevronRight size={20} />
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
