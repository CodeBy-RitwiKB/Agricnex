"use client";
import React, { useState, useEffect } from "react";
import { Package, Search, Plus, Filter, MoreVertical, Edit, Trash2, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const SmartPriceSuggestion = ({ category, price }: { category: string; price: number }) => {
    const [suggestion, setSuggestion] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPricing = async () => {
            try {
                // Map category names to support model matching
                let cleanCat = category;
                if (category === "Growth Promoters") cleanCat = "Nutrients";

                const res = await fetch(`/api/ai/pricing?category=${encodeURIComponent(cleanCat)}&price=${price}`);
                const data = await res.json();
                if (data.success) {
                    setSuggestion(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPricing();
    }, [category, price]);

    if (loading) return <span className="text-[10px] text-gray-400">Analyzing...</span>;
    if (!suggestion) return null;

    const isMarkup = suggestion.markupPercent > 0;
    const isMarkdown = suggestion.markupPercent < 0;

    return (
        <div className="flex flex-col items-start gap-1">
            <span className="font-black text-sm text-[#1b6b3e]">₹{suggestion.suggestedPrice.toLocaleString()}</span>
            {suggestion.markupPercent !== 0 ? (
                <span className={cn(
                    "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border block w-fit cursor-help",
                    isMarkup 
                        ? "bg-green-500/10 text-green-500 border-green-500/20" 
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                )} title={suggestion.reason}>
                    {isMarkup ? "Markup" : "Promo"}: {isMarkup ? "+" : ""}{suggestion.markupPercent}%
                </span>
            ) : (
                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-gray-500/20 bg-gray-500/10 text-gray-500 block w-fit">
                    Stable
                </span>
            )}
        </div>
    );
};

export default function MerchantInventory() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("All Products");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [activeMenuProductId, setActiveMenuProductId] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<any | null>(null);

    const [editForm, setEditForm] = useState({
        name: "",
        price: "",
        stock_quantity: "",
        status: "",
        description: ""
    });

    const openEditModal = (product: any) => {
        setEditingProduct(product);
        setEditForm({
            name: product.name,
            price: product.price.toString(),
            stock_quantity: (product.stock_quantity ?? 0).toString(),
            status: product.status,
            description: product.description || ""
        });
        setActiveMenuProductId(null);
    };

    const toggleStatus = async (product: any) => {
        const newStatus = product.status === "active" ? "inactive" : "active";
        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            const json = await res.json();
            if (json.success) {
                setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
                setActiveMenuProductId(null);
            } else {
                alert(json.error || "Failed to update status.");
            }
        } catch (err) {
            console.error(err);
            alert("Error updating status.");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "DELETE"
            });
            const json = await res.json();
            if (json.success) {
                setProducts(prev => prev.filter(p => p.id !== id));
                setDeletingProduct(null);
            } else {
                alert(json.error || "Failed to delete product.");
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting product.");
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        try {
            const res = await fetch(`/api/products/${editingProduct.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: editForm.name,
                    price: Number(editForm.price),
                    stock_quantity: Number(editForm.stock_quantity),
                    status: editForm.status,
                    description: editForm.description
                })
            });
            const json = await res.json();
            if (json.success) {
                setProducts(prev => prev.map(p => p.id === editingProduct.id ? { 
                    ...p, 
                    name: editForm.name,
                    price: Number(editForm.price),
                    stock_quantity: Number(editForm.stock_quantity),
                    status: editForm.status,
                    description: editForm.description
                } : p));
                setEditingProduct(null);
            } else {
                alert(json.error || "Failed to update product.");
            }
        } catch (err) {
            console.error(err);
            alert("Error updating product.");
        }
    };

    // Quick load action
    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/products?limit=100&myProducts=true");
            const json = await res.json();
            if (json.success) {
                setProducts(json.data);
            }
        } catch (err) {
            console.error("Failed to load inventory:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeFilter]);

    const filteredProducts = products.filter(p => {
        if (p.categories?.name?.toLowerCase() === "offers") return false;

        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;

        const stock = p.stock_quantity ?? 0;
        if (activeFilter === "In Stock") {
            return stock > 10;
        } else if (activeFilter === "Low Stock") {
            return stock > 0 && stock <= 10;
        } else if (activeFilter === "Out of Stock") {
            return stock === 0;
        } else if (activeFilter === "Drafts") {
            return p.status === "draft" || p.status === "inactive";
        }
        return true; // "All Products"
    });

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header with Search & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">Product Inventory</h1>
                    <p className="text-xs font-bold text-gray-400">Manage your product listings and stock levels.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff9900] transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Find products..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl py-3 pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-[#ff9900] transition-all w-64"
                        />
                    </div>
                    <Link 
                        href="/merchant/inventory/new"
                        className="bg-[#ff9900] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
                    >
                        <Plus size={16} /> Add Product
                    </Link>
                </div>
            </div>

            {/* Smart Pricing Indicator Bar */}
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-orange-500/10 to-[#1b6b3e]/10 border border-orange-500/20 px-6 py-4 rounded-3xl w-fit">
                <Sparkles className="text-[#ff9900]" size={20} />
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    <span className="text-[#ff9900] font-black uppercase tracking-wider mr-1.5">Smart Dynamic Pricing Active:</span>
                    Prices automatically recommend adjustments based on Prophet/SARIMA crop demand forecasts. Hover on badges to see forecasting reasons.
                </p>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-4">
                {["All Products", "In Stock", "Low Stock", "Out of Stock", "Drafts"].map((filter, i) => (
                    <button 
                        key={i} 
                        onClick={() => setActiveFilter(filter)}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                            activeFilter === filter 
                                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md shadow-black/10" 
                                : "bg-[var(--card)] border-[var(--border)] text-gray-500 hover:border-[#ff9900]/30 hover:text-white"
                        )}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Inventory Table */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] overflow-hidden shadow-xl shadow-black/5">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="animate-spin text-[#ff9900]" size={36} />
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Syncing product inventory details...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-xs font-black uppercase tracking-widest">No products found</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-6 py-6">Product</th>
                                <th className="px-6 py-6">Category</th>
                                <th className="px-6 py-6">Current Price</th>
                                <th className="px-6 py-6 flex items-center gap-1.5">
                                    Suggested Price <Sparkles size={12} className="text-[#ff9900]" />
                                </th>
                                <th className="px-6 py-6">Stock</th>
                                <th className="px-6 py-6">Status</th>
                                <th className="px-6 py-6 text-right pr-10">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {paginatedProducts.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-white border border-[var(--border)] overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                                                {p.image_url ? (
                                                    <img src={p.image_url} alt={p.name} className="w-full h-full object-contain p-1" />
                                                ) : (
                                                    <span className="text-xl">🌱</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-tight">{p.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                                            {p.categories?.name || "General"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 font-black text-sm">₹{p.price.toLocaleString()}</td>
                                    <td className="px-6 py-6">
                                        <SmartPriceSuggestion category={p.categories?.name || "Insecticides"} price={p.price} />
                                    </td>
                                    <td className="px-6 py-6 font-bold text-sm">{p.stock_quantity ?? 0} Units</td>
                                    <td className="px-6 py-6">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                            p.status === "active" ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500"
                                        )}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 relative text-right pr-10">
                                        <button 
                                            onClick={() => setActiveMenuProductId(activeMenuProductId === p.id ? null : p.id)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400"
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {activeMenuProductId === p.id && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setActiveMenuProductId(null)} />
                                                <div className="absolute right-8 top-14 w-40 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <button 
                                                        onClick={() => openEditModal(p)}
                                                        className="w-full px-4 py-2.5 text-left text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 hover:text-[#ff9900]"
                                                    >
                                                        <Edit size={14} /> Edit Listing
                                                    </button>
                                                    <button 
                                                        onClick={() => toggleStatus(p)}
                                                        className="w-full px-4 py-2.5 text-left text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 hover:text-[#ff9900]"
                                                    >
                                                        <Package size={14} /> {p.status === "active" ? "Deactivate" : "Activate"}
                                                    </button>
                                                    <div className="border-t border-[var(--border)] my-1" />
                                                    <button 
                                                        onClick={() => {
                                                            setDeletingProduct(p);
                                                            setActiveMenuProductId(null);
                                                        }}
                                                        className="w-full px-4 py-2.5 text-left text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
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
                        disabled={currentPage === 1 || loading}
                        className="px-6 py-3 border border-[var(--border)] rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-black dark:hover:border-white transition-all bg-[var(--card)]"
                    >
                        Previous
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        Page <span className="text-[var(--foreground)]">{currentPage}</span> of <span className="text-[var(--foreground)]">{totalPages}</span>
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || loading}
                        className="px-6 py-3 border border-[var(--border)] rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-black dark:hover:border-white transition-all bg-[var(--card)]"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Edit Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 animate-in fade-in duration-300">
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] max-w-lg w-full p-8 md:p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-1">Edit Product</h2>
                        <p className="text-xs font-bold text-gray-400 mb-6">Modify details for {editingProduct.name}</p>
                        
                        <form onSubmit={handleEditSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Product Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={editForm.name} 
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-[#ff9900] transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Price (₹)</label>
                                    <input 
                                        type="number" 
                                        required 
                                        min="0"
                                        value={editForm.price} 
                                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-[#ff9900] transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Stock Qty</label>
                                    <input 
                                        type="number" 
                                        required 
                                        min="0"
                                        value={editForm.stock_quantity} 
                                        onChange={(e) => setEditForm({ ...editForm, stock_quantity: e.target.value })}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-[#ff9900] transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status</label>
                                <select 
                                    value={editForm.status} 
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-[#ff9900] transition-colors"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</label>
                                <textarea 
                                    value={editForm.description} 
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={3}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-[#ff9900] transition-colors"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setEditingProduct(null)}
                                    className="flex-1 py-3 px-6 rounded-2xl border border-[var(--border)] text-xs font-black uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 py-3 px-6 rounded-2xl bg-[#ff9900] text-white text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 animate-in fade-in duration-300">
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] max-w-md w-full p-8 md:p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-1 text-red-500">Delete Product?</h2>
                        <p className="text-xs font-bold text-gray-400 mb-6">Are you sure you want to delete <span className="font-black text-black dark:text-white">"{deletingProduct.name}"</span>? This action cannot be undone.</p>
                        
                        <div className="flex gap-4">
                            <button 
                                type="button" 
                                onClick={() => setDeletingProduct(null)}
                                className="flex-1 py-3 px-6 rounded-2xl border border-[var(--border)] text-xs font-black uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                onClick={() => handleDelete(deletingProduct.id)}
                                className="flex-1 py-3 px-6 rounded-2xl bg-red-500 text-white text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
