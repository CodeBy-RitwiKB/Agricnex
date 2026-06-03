"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Package } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AddProductPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageSource, setImageSource] = useState<"upload" | "url">("upload");
    const [newProduct, setNewProduct] = useState({
        name: "",
        price: "",
        stockQuantity: "100",
        unit: "kg",
        description: "",
        image_url: "",
        categoryName: "Insecticides"
    });

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.price || !newProduct.categoryName || !newProduct.stockQuantity || !newProduct.unit || !newProduct.description || !newProduct.image_url) {
            alert("Please fill in all fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            let finalImageUrl = newProduct.image_url;

            // If it is a locally uploaded base64 file, upload it to Cloudinary first
            if (newProduct.image_url.startsWith("data:")) {
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ file: newProduct.image_url }),
                });
                const uploadData = await uploadRes.json();
                if (uploadData.success) {
                    finalImageUrl = uploadData.url;
                } else {
                    alert("Cloudinary upload failed: " + uploadData.error);
                    setIsSubmitting(false);
                    return;
                }
            }

            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newProduct, image_url: finalImageUrl }),
            });
            const data = await res.json();
            if (data.success) {
                router.push("/merchant/inventory");
            } else {
                alert(data.error || "Failed to create product.");
            }
        } catch (err) {
            console.error(err);
            alert("Error creating product listing.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] py-12 px-6 lg:px-12">
            <div className="max-w-7xl w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header & Back Navigation */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[var(--border)] pb-8 gap-4">
                    <div>
                        <Link 
                            href="/merchant/inventory" 
                            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#ff9900] mb-3 hover:text-orange-600 transition-colors"
                        >
                            <ArrowLeft size={12} /> Back to Inventory
                        </Link>
                        <h1 className="text-3xl font-black uppercase tracking-tight text-[var(--foreground)] mb-1">Create Listing</h1>
                        <p className="text-xs font-bold text-gray-400">Add a new product offering directly to your storefront catalog.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-[var(--card)] border border-[var(--border)] px-4 py-3 rounded-2xl">
                        <Package className="text-[#ff9900]" size={20} />
                        <span className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">New Store Item</span>
                    </div>
                </div>

                {/* Form Elements */}
                <form onSubmit={handleCreateProduct} className="space-y-6">
                    
                    {/* Row 1: Product Name & Category */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Product Name *</label>
                            <input 
                                type="text" 
                                required 
                                value={newProduct.name || ""}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                placeholder="e.g. Premium NPK Fertilizer Pack"
                                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-[#ff9900] text-[var(--foreground)] transition-all placeholder:text-gray-500"
                            />
                        </div>
                        <div className="md:col-span-1 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category *</label>
                            <select 
                                value={newProduct.categoryName || ""}
                                onChange={(e) => setNewProduct({ ...newProduct, categoryName: e.target.value })}
                                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-[#ff9900] text-[var(--foreground)] transition-all cursor-pointer"
                            >
                                <option value="Insecticides">Insecticides</option>
                                <option value="Nutrients">Nutrients (Fertilizers)</option>
                                <option value="Vegetable & Fruit Seeds">Vegetable & Fruit Seeds</option>
                                <option value="Growth Promoters">Growth Promoters</option>
                                <option value="Farm Machinery">Farm Machinery</option>
                                <option value="Urban Gardening">Urban Gardening</option>
                                <option value="Flower Seeds">Flower Seeds</option>
                                <option value="Fungicides">Fungicides</option>
                                <option value="Herbicides">Herbicides</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 2: Description (Moved Up) */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description *</label>
                        <textarea 
                            required
                            value={newProduct.description || ""}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                            placeholder="Enter full listing description here..."
                            rows={4}
                            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-[#ff9900] text-[var(--foreground)] resize-none transition-all placeholder:text-gray-500"
                        />
                    </div>

                    {/* Row 3: Price, Stock & Unit */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Price (INR) *</label>
                            <input 
                                type="number" 
                                required 
                                value={newProduct.price || ""}
                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                placeholder="e.g. 450"
                                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-[#ff9900] text-[var(--foreground)] transition-all placeholder:text-gray-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Stock Quantity *</label>
                            <input 
                                type="number" 
                                required
                                value={newProduct.stockQuantity || ""}
                                onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })}
                                placeholder="100"
                                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-[#ff9900] text-[var(--foreground)] transition-all placeholder:text-gray-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Unit *</label>
                            <input 
                                type="text" 
                                required
                                value={newProduct.unit || ""}
                                onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                                placeholder="e.g. kg, bottle"
                                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-[#ff9900] text-[var(--foreground)] transition-all placeholder:text-gray-500"
                            />
                        </div>
                    </div>

                    {/* Row 4: Product Image (Moved Down) */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Product Image *</label>
                        <div className="flex flex-col gap-4 bg-[var(--card)] border border-[var(--border)] p-5 rounded-2xl">
                            {/* Toggle Tabs */}
                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit min-w-[240px]">
                                <button
                                    type="button"
                                    onClick={() => setImageSource("upload")}
                                    className={cn(
                                        "flex-1 py-2 px-4 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
                                        imageSource === "upload"
                                            ? "bg-white dark:bg-gray-700 text-[#ff9900] shadow-sm"
                                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    )}
                                >
                                    Upload File
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageSource("url")}
                                    className={cn(
                                        "flex-1 py-2 px-4 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
                                        imageSource === "url"
                                            ? "bg-white dark:bg-gray-700 text-[#ff9900] shadow-sm"
                                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    )}
                                >
                                    Paste URL
                                </button>
                            </div>

                            {imageSource === "upload" ? (
                                <div className="py-2">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setNewProduct({ ...newProduct, image_url: reader.result as string });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="w-full text-xs font-bold focus:outline-none file:mr-3 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-orange-500/10 file:text-[#ff9900] file:cursor-pointer cursor-pointer"
                                    />
                                </div>
                            ) : (
                                <div className="py-2">
                                    <input 
                                        type="text" 
                                        value={(newProduct.image_url.startsWith("data:") ? "" : newProduct.image_url) || ""}
                                        onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                                        placeholder="https://example.com/image.png"
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-2 px-3.5 text-xs font-bold focus:outline-none focus:border-[#ff9900] text-[var(--foreground)]"
                                    />
                                </div>
                            )}

                            {newProduct.image_url && (
                                <div className="mt-1 flex items-center gap-3">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-[var(--border)] relative group">
                                        <img src={newProduct.image_url} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setNewProduct({ ...newProduct, image_url: "" })}
                                        className="text-[10px] font-black uppercase text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        Remove Image
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-8 border-t border-[var(--border)]">
                        <Link 
                            href="/merchant/inventory"
                            className="flex-1 bg-[var(--card)] border border-[var(--border)] text-gray-500 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-center hover:bg-gray-50 transition-all"
                        >
                            Cancel Listing
                        </Link>
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-[#ff9900] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="animate-spin" size={14} />}
                            {isSubmitting ? "Listing..." : "Submit Listing"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
