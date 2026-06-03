"use client";
import React, { useState, useEffect } from "react";
import { ShoppingBag, Search, Truck, CheckCircle, Clock, ChevronRight, Package, RotateCcw, Loader2 } from "lucide-react";
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

export default function UserOrders() {
    const { data: session, isPending: sessionLoading } = useSession();
    const user = session?.user;
    const { addItem } = useCart();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All Orders");
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;

        const fetchOrders = async () => {
            try {
                const res = await fetch(`/api/checkout/order?userId=${user.id}`);
                const data = await res.json();
                if (data.success) {
                    setOrders(data.orders || []);
                }
            } catch (err) {
                console.error("Error fetching orders:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user?.id]);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleBuyAgain = (order: Order) => {
        let addedCount = 0;
        order.order_items.forEach((item) => {
            if (item.products) {
                addItem({
                    id: item.products.id,
                    name: item.products.name,
                    price: Number(item.price_at_purchase),
                    image_url: item.products.image_url || ""
                }, item.quantity);
                addedCount += item.quantity;
            }
        });
        if (addedCount > 0) {
            showToast(`Added ${addedCount} items back to your cart!`);
        }
    };

    // Filter orders based on active tab and search query
    const filteredOrders = orders.filter((order) => {
        // Status filter
        const status = order.status.toLowerCase();
        if (activeFilter === "In Transit" && !["processing", "shipped"].includes(status)) return false;
        if (activeFilter === "Delivered" && status !== "delivered") return false;
        if (activeFilter === "Cancelled" && status !== "cancelled") return false;

        // Search query
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            const orderIdMatch = order.id.toLowerCase().includes(query);
            const productMatch = order.order_items.some((item) => 
                item.products?.name.toLowerCase().includes(query)
            );
            return orderIdMatch || productMatch;
        }

        return true;
    });

    if (sessionLoading || loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-[#1b6b3e] animate-spin" />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading purchases...</p>
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
                    <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">My Orders</h1>
                    <p className="text-xs font-bold text-gray-400">Track and manage your agricultural purchases.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1b6b3e] transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Find orders or products..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl py-3 pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-[#1b6b3e] transition-all w-64 text-gray-700 dark:text-gray-100"
                        />
                    </div>
                </div>
            </div>

            {/* Order Filters */}
            <div className="flex flex-wrap gap-4">
                {["All Orders", "In Transit", "Delivered", "Cancelled"].map((filter, i) => (
                    <button 
                        key={i} 
                        onClick={() => setActiveFilter(filter)}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                            activeFilter === filter ? "bg-[#1b6b3e] text-white border-[#1b6b3e]" : "bg-[var(--card)] border-[var(--border)] text-gray-500 hover:border-[#1b6b3e]/30"
                        )}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div className="space-y-6">
                {filteredOrders.length === 0 ? (
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-20 text-center space-y-6">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-300">
                            <ShoppingBag size={48} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter">No Orders Found</h3>
                            <p className="text-sm font-bold text-gray-400">We couldn't find any orders matching your criteria.</p>
                        </div>
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        const status = order.status.toLowerCase();
                        
                        // Status mapping
                        const isPlaced = true;
                        const isProcessed = ["processing", "shipped", "delivered"].includes(status);
                        const isShipped = ["shipped", "delivered"].includes(status);
                        const isDelivered = status === "delivered";

                        return (
                            <div key={order.id} className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-8 shadow-xl shadow-black/5 hover:border-[#1b6b3e]/30 transition-all group">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-[var(--border)] pb-8 mb-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-gray-800 overflow-hidden border border-[var(--border)] flex items-center justify-center">
                                            <img 
                                                src={order.order_items?.[0]?.products?.image_url || "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?q=80&w=200&auto=format&fit=crop"} 
                                                alt="Product" 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-black uppercase tracking-tight">Order #{order.id.substring(0, 8).toUpperCase()}</p>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-md text-[8px] font-black uppercase",
                                                    status === "delivered" ? "bg-green-500/10 text-green-500" :
                                                    status === "cancelled" ? "bg-red-500/10 text-red-500" :
                                                    "bg-orange-500/10 text-orange-500"
                                                )}>{order.status}</span>
                                            </div>
                                            <p className="text-lg font-black text-[#1b6b3e]">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                Ordered on {new Date(order.created_at).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })} • {order.order_items?.length || 0} Items
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <button 
                                            onClick={() => handleBuyAgain(order)}
                                            className="px-6 py-3 rounded-2xl bg-[#1b6b3e] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#145230] transition-all flex items-center gap-2"
                                        >
                                            <RotateCcw size={14} /> Buy Again
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Status Tracker */}
                                {status !== "cancelled" ? (
                                    <div className="grid grid-cols-4 gap-4">
                                        {[
                                            { icon: ShoppingBag, label: "Placed", done: isPlaced },
                                            { icon: Package, label: "Processed", done: isProcessed },
                                            { icon: Truck, label: "Shipped", done: isShipped },
                                            { icon: CheckCircle, label: "Delivered", done: isDelivered },
                                        ].map((step, i) => (
                                            <div key={i} className="flex flex-col items-center text-center space-y-2">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                    step.done ? "bg-green-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                                )}>
                                                    <step.icon size={18} />
                                                </div>
                                                <p className={cn("text-[8px] font-black uppercase tracking-[0.2em]", step.done ? "text-green-500" : "text-gray-400")}>{step.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-2 bg-red-500/10 rounded-2xl text-red-500 text-xs font-black uppercase tracking-widest">
                                        This order has been cancelled
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
