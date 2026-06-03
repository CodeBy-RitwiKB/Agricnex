"use client";
import React, { useState } from "react";
import { ShoppingBag, Search, Eye, Truck, CheckCircle, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MerchantOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const itemsPerPage = 5;

    React.useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch("/api/merchants/orders");
                const json = await res.json();
                if (json.success) {
                    // Map database fields to UI keys
                    const mapped = json.data.map((order: any) => {
                        const itemsCount = order.order_items.reduce((sum: number, item: any) => sum + item.quantity, 0);
                        const statusMapping: Record<string, string> = {
                            pending: "New",
                            shipped: "In Transit",
                            delivered: "Completed",
                        };
                        const mappedStatus = statusMapping[order.status] || "New";
                        
                        return {
                            id: order.id.slice(0, 8).toUpperCase(),
                            fullId: order.id,
                            date: new Date(order.created_at).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                            }),
                            items: itemsCount,
                            customerInitials: order.users?.name ? order.users.name.split(" ").map((n: string) => n[0]).join("") : "C",
                            customerName: order.users?.name || "Anonymous Customer",
                            customerEmail: order.users?.email || "",
                            location: order.shipping_address || "India",
                            amount: Number(order.total_amount),
                            status: mappedStatus,
                            paymentMethod: order.payment_method || "UPI",
                            paymentStatus: order.payment_status || "paid",
                            rawItems: order.order_items || []
                        };
                    });
                    setOrders(mapped);
                }
            } catch (err) {
                console.error("Failed to load orders:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Filter logic
    const filteredOrders = orders.filter(o => 
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Reset pagination when search query changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">Customer Orders</h1>
                    <p className="text-xs font-bold text-gray-400">Track and manage your sales and fulfillments.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff9900] transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Order ID, Customer..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl py-3 pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-[#ff9900] transition-all w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Order Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "New Orders", value: orders.filter(o => o.status === "New").length.toString(), icon: Clock, color: "text-blue-500" },
                    { label: "In Transit", value: orders.filter(o => o.status === "In Transit").length.toString(), icon: Truck, color: "text-orange-500" },
                    { label: "Completed", value: orders.filter(o => o.status === "Completed").length.toString(), icon: CheckCircle, color: "text-green-500" },
                    { label: "Total Revenue", value: `₹${orders.reduce((sum, o) => sum + o.amount, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: ShoppingBag, color: "text-purple-500" },
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-3xl flex items-center gap-6 shadow-xl shadow-black/5 hover:border-[#ff9900]/30 transition-all">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.color.replace('text', 'bg').replace('500', '500/10'))}>
                            <stat.icon size={24} className={stat.color} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-xl font-black tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Orders Table */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] overflow-x-auto shadow-xl shadow-black/5">
                {loading ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-xs font-black uppercase tracking-widest">Loading orders...</p>
                    </div>
                ) : paginatedOrders.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-xs font-black uppercase tracking-widest">No orders found</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-6 py-6">Order Details</th>
                                <th className="px-6 py-6">Customer</th>
                                <th className="px-6 py-6">Amount</th>
                                <th className="px-6 py-6">Status</th>
                                <th className="px-6 py-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {paginatedOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="px-6 py-6">
                                        <div>
                                            <p className="text-sm font-black uppercase tracking-tight">Order #{order.id}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{order.date} • {order.items} {order.items === 1 ? 'Item' : 'Items'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 font-black text-[10px]">{order.customerInitials}</div>
                                            <div>
                                                <p className="text-[11px] font-black uppercase">{order.customerName}</p>
                                                <p className="text-[9px] font-bold text-gray-400">{order.location}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 font-black text-sm">₹{order.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-6 py-6">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center w-fit gap-2",
                                            order.status === "New" && "bg-blue-500/10 text-blue-500",
                                            order.status === "In Transit" && "bg-orange-500/10 text-orange-500",
                                            order.status === "Completed" && "bg-green-500/10 text-green-500"
                                        )}>
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                order.status === "New" && "bg-blue-500 animate-pulse",
                                                order.status === "In Transit" && "bg-orange-500 animate-pulse",
                                                order.status === "Completed" && "bg-green-500"
                                            )}></div> {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <button 
                                            onClick={() => setSelectedOrder(order)}
                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#ff9900] hover:underline"
                                        >
                                            <Eye size={14} /> Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
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

            {/* Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-[var(--card)] border border-[var(--border)] w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
                        
                        {/* Modal Header */}
                        <div className="p-8 border-b border-[var(--border)] flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-black tracking-tighter uppercase mb-1">Order Details</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Order ID: {selectedOrder.fullId}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className="p-2.5 bg-white border border-[var(--border)] rounded-2xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-black"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-6 overflow-y-auto">
                            {/* Customer Summary & Metadata */}
                            <div className="grid grid-cols-2 gap-6 bg-[var(--background)] p-6 rounded-3xl border border-[var(--border)]">
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                                    <p className="text-xs font-black uppercase">{selectedOrder.customerName}</p>
                                    <p className="text-[10px] font-bold text-gray-400">{selectedOrder.customerEmail}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Shipping Destination</p>
                                    <p className="text-xs font-bold text-gray-600">{selectedOrder.location}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Status</p>
                                    <span className="text-[9px] font-black uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded-md">
                                        {selectedOrder.paymentStatus} ({selectedOrder.paymentMethod})
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Status</p>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border",
                                        selectedOrder.status === "New" && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                                        selectedOrder.status === "In Transit" && "bg-orange-500/10 text-orange-500 border-orange-500/20",
                                        selectedOrder.status === "Completed" && "bg-green-500/10 text-green-500 border-green-500/20"
                                    )}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                            </div>

                            {/* Itemized Order Table */}
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Products Ordered</p>
                                <div className="border border-[var(--border)] rounded-2xl overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50 text-[9px] font-black text-gray-400 uppercase tracking-wider border-b border-[var(--border)]">
                                            <tr>
                                                <th className="px-5 py-4">Item Name</th>
                                                <th className="px-5 py-4 text-center">Qty</th>
                                                <th className="px-5 py-4 text-right">Unit Price</th>
                                                <th className="px-5 py-4 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border)] text-xs">
                                            {selectedOrder.rawItems.map((item: any, idx: number) => {
                                                const price = Number(item.price_at_purchase);
                                                const total = price * item.quantity;
                                                return (
                                                    <tr key={idx} className="hover:bg-gray-50/20 transition-colors">
                                                        <td className="px-5 py-4 flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-white border border-[var(--border)] overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                                                                {item.products?.image_url ? (
                                                                    <img src={item.products.image_url} alt="" className="w-full h-full object-contain p-0.5" />
                                                                ) : (
                                                                    <span className="text-base">🌱</span>
                                                                )}
                                                            </div>
                                                            <span className="font-black uppercase text-gray-700">{item.products?.name || "Product Item"}</span>
                                                        </td>
                                                        <td className="px-5 py-4 text-center font-bold text-gray-500">{item.quantity}</td>
                                                        <td className="px-5 py-4 text-right font-bold text-gray-500">₹{price.toLocaleString()}</td>
                                                        <td className="px-5 py-4 text-right font-black text-gray-800">₹{total.toLocaleString()}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-[var(--border)] flex justify-between items-center bg-gray-50/50">
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Amount Paid</p>
                                <p className="text-2xl font-black tracking-tight text-[#ff9900]">₹{selectedOrder.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="bg-black hover:bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-colors"
                            >
                                Close Details
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
