"use client";
import React from "react";
import { useSession } from "@/lib/auth-client";
import {
    Store, Package, DollarSign, Plus, ChevronRight,
    Zap, TrendingUp, ShieldCheck, Users, ShoppingBag
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function MerchantDashboard() {
    const { data: session } = useSession();
    const user = session?.user;
    const [products, setProducts] = React.useState<any[]>([]);
    const [orders, setOrders] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // Fetch products
                const prodRes = await fetch("/api/products?limit=5&myProducts=true");
                const prodJson = await prodRes.json();
                if (prodJson.success) {
                    setProducts(prodJson.data);
                }

                // Fetch orders
                const ordersRes = await fetch("/api/merchants/orders");
                const ordersJson = await ordersRes.json();
                if (ordersJson.success) {
                    setOrders(ordersJson.data);
                }
            } catch (err) {
                console.error("Error loading dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // Calculate dynamic stats
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    
    const todayStr = new Date().toDateString();
    const todaysSales = orders
        .filter(order => {
            if (!order.created_at) return false;
            return new Date(order.created_at).toDateString() === todayStr;
        })
        .reduce((sum, order) => sum + Number(order.total_amount), 0);

    const activeOrdersCount = orders.filter(
        order => order.status === "pending" || order.status === "shipped"
    ).length;

    const salesCount = orders.length;

    // Simulate store visits proportional to sales
    const visitsCount = Math.max(15, salesCount * 12 + 45);

    // Format helpers
    const formatNumber = (num: number) => {
        if (num >= 1000000) return `₹${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
        return `₹${num}`;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Immersive Merchant Hero Section */}
            <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-[#ff9900] to-[#e68a00] p-12 text-white shadow-2xl shadow-orange-500/20">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-[32px] bg-white/20 backdrop-blur-xl border-2 border-white/30 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-110">
                                {user?.image ? (
                                    <img src={user.image} alt={user.name || "Store Logo"} className="w-full h-full object-cover" />
                                ) : (
                                    <Store size={64} className="text-white" />
                                )}
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <h1 className="text-4xl font-black tracking-tighter uppercase whitespace-nowrap">{user?.name || 'Green Valley Store'}</h1>
                                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[9px] font-black uppercase tracking-widest border border-white/20">PRO MERCHANT</span>
                            </div>
                            <p className="text-white/80 font-bold text-lg mb-6 max-w-xl leading-relaxed">
                                Your agricultural empire is growing. You've reached <span className="text-white font-black">{visitsCount.toLocaleString()} farmers</span> this month.
                            </p>
                        </div>
                    </div>
 
                    <div className="flex gap-4 shrink-0 md:mr-6">
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center min-w-[140px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Today's Sales</p>
                            <p className="text-2xl font-black tracking-tighter">₹{todaysSales.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center min-w-[140px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Active Orders</p>
                            <p className="text-2xl font-black tracking-tighter">{activeOrdersCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dynamic Performance Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Revenue", value: formatNumber(totalRevenue), trend: "+12%", icon: DollarSign, color: "text-green-500", bgColor: "bg-green-500/10" },
                    { label: "Sales Count", value: salesCount.toLocaleString(), trend: "+8%", icon: TrendingUp, color: "text-[#ff9900]", bgColor: "bg-orange-500/10" },
                    { label: "Store Visits", value: `${(visitsCount * 1.5).toFixed(0)}`, trend: "+22%", icon: Users, color: "text-blue-500", bgColor: "bg-blue-500/10" },
                ].map((card, i) => (
                    <div key={i} className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-[32px] shadow-xl shadow-black/5 hover:scale-[1.02] transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", card.bgColor)}>
                                <card.icon size={20} className={card.color} />
                            </div>
                            <span className="text-[9px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">{card.trend}</span>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
                        <p className="text-2xl font-black">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Live Inventory Table */}
            <section className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-8 shadow-xl shadow-black/5">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <Package size={24} />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tighter">Live Inventory</h2>
                    </div>
                    <Link
                        href="/merchant/inventory/new"
                        className="bg-[#ff9900] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                    >
                        <Plus size={14} /> Add Product
                    </Link>
                </div>

                <div className="overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-[var(--border)]">
                            <tr>
                                <th className="pb-4">Product Details</th>
                                <th className="pb-4">Stock Status</th>
                                <th className="pb-4">Price</th>
                                <th className="pb-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-6 text-center text-xs font-bold text-gray-400">Loading inventory overview...</td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-6 text-center text-xs font-bold text-gray-400">No products found. Start listing items to see them here.</td>
                                </tr>
                            ) : (
                                products.slice(0, 3).map((p) => (
                                    <tr key={p.id} className="group transition-colors hover:bg-gray-50/50">
                                        <td className="py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center border border-[var(--border)]">
                                                    {p.image_url ? (
                                                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xl">🌱</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-tight line-clamp-1">{p.name}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase">{p.categories?.name || "General"} • {p.unit || "kg"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", (p.stock_quantity ?? 0) > 0 ? "bg-green-500" : "bg-red-500")}></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">{p.stock_quantity ?? 0} Units Left</span>
                                            </div>
                                        </td>
                                        <td className="py-6">
                                            <p className="text-sm font-black text-[#ff9900]">₹{p.price.toLocaleString()}</p>
                                        </td>
                                        <td className="py-6">
                                            <Link href="/merchant/inventory" className="text-[10px] font-black uppercase tracking-widest hover:text-[#ff9900] flex items-center gap-1 group/btn">
                                                Manage <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                                            </Link>
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
