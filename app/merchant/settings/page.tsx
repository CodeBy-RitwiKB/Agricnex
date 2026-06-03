"use client";
import React, { useState, useEffect } from "react";
import { Settings, Save, Shield, Bell, CreditCard, Store, CheckCircle, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

export default function MerchantSettings() {
    const { data: session } = useSession();
    const user = session?.user;
    const [isSaving, setIsSaving] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);
    const [imageSource, setImageSource] = useState<"upload" | "url">("upload");
    const [settings, setSettings] = useState({
        storeName: "Green Valley Organics",
        supportEmail: "merchant@greenvalley.com",
        category: "Nutrients",
        payoutUpi: "greenvalley@okaxis",
        payoutBank: "State Bank of India",
        emailAlerts: true,
        pricingNotifications: true,
        storeLogo: "",
        bio: "Premium supplier of organic fertilizers, nutrients, and gardening gear to FPOs and independent farmers."
    });

    useEffect(() => {
        if (user) {
            setSettings(prev => ({
                ...prev,
                storeName: user.name || prev.storeName,
                storeLogo: user.image || prev.storeLogo,
            }));
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let finalLogoUrl = settings.storeLogo;

            // If it is a locally uploaded base64 logo file, upload to Cloudinary first
            if (settings.storeLogo && settings.storeLogo.startsWith("data:")) {
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ file: settings.storeLogo }),
                });
                const uploadData = await uploadRes.json();
                if (uploadData.success) {
                    finalLogoUrl = uploadData.url;
                    setSettings(prev => ({ ...prev, storeLogo: uploadData.url }));
                } else {
                    alert("Logo upload failed: " + uploadData.error);
                    setIsSaving(false);
                    return;
                }
            }

            // Update user in DB
            const updateRes = await fetch("/api/user", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user?.id,
                    name: settings.storeName,
                    image: finalLogoUrl,
                }),
            });
            const updateData = await updateRes.json();
            if (!updateRes.ok || !updateData.success) {
                throw new Error(updateData.error || "Failed to update profile");
            }

            setIsSaving(false);
            setSavedSuccess(true);
            setTimeout(() => {
                window.location.reload();
            }, 600);
        } catch (err: any) {
            console.error("Save error:", err);
            alert("Error saving settings: " + (err.message || err));
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[var(--border)] pb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">Store Settings</h1>
                    <p className="text-xs font-bold text-gray-400">Manage your merchant account preferences and system properties.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* 1. Store Profile Details */}
                <section className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-8 shadow-xl shadow-black/5 space-y-6">
                    <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                        <Store className="text-[#ff9900]" size={20} />
                        <h3 className="text-lg font-black uppercase tracking-tight">Store Profile</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Store Front Name</label>
                            <input 
                                type="text" 
                                value={settings.storeName || ""}
                                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-[#ff9900] text-[var(--foreground)]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Support Email Address</label>
                            <input 
                                type="email" 
                                value={settings.supportEmail || ""}
                                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-[#ff9900] text-[var(--foreground)]"
                            />
                        </div>
                    </div>

                    {/* Bio Description */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Store Bio / Description</label>
                        <textarea 
                            value={settings.bio || ""}
                            onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                            placeholder="Introduce your brand and values to the farmers..."
                            rows={3}
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-[#ff9900] text-[var(--foreground)] resize-none transition-all placeholder:text-gray-500"
                        />
                    </div>

                    {/* Store Logo / Banner Upload */}
                    <div className="space-y-2 pt-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Store Logo / Brand Image</label>
                        <div className="flex flex-col md:flex-row gap-6 bg-[var(--background)] border border-[var(--border)] p-6 rounded-2xl">
                            
                            {/* Logo Selector Section */}
                            <div className="flex-1 space-y-4">
                                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit min-w-[200px]">
                                    <button
                                        type="button"
                                        onClick={() => setImageSource("upload")}
                                        className={cn(
                                            "flex-1 py-1.5 px-4 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
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
                                            "flex-1 py-1.5 px-4 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
                                            imageSource === "url"
                                                ? "bg-white dark:bg-gray-700 text-[#ff9900] shadow-sm"
                                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        )}
                                    >
                                        Paste URL
                                    </button>
                                </div>

                                {imageSource === "upload" ? (
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setSettings({ ...settings, storeLogo: reader.result as string });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="w-full text-xs font-bold focus:outline-none file:mr-3 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-orange-500/10 file:text-[#ff9900] file:cursor-pointer cursor-pointer"
                                    />
                                ) : (
                                    <input 
                                        type="text" 
                                        value={(settings.storeLogo.startsWith("data:") ? "" : settings.storeLogo) || ""}
                                        onChange={(e) => setSettings({ ...settings, storeLogo: e.target.value })}
                                        placeholder="https://example.com/logo.png"
                                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl py-2 px-3.5 text-xs font-bold focus:outline-none focus:border-[#ff9900] text-[var(--foreground)]"
                                    />
                                )}
                            </div>

                            {/* Logo Preview Section */}
                            <div className="flex items-center gap-4 border-l border-dashed border-[var(--border)] pl-0 md:pl-6">
                                {settings.storeLogo ? (
                                    <>
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[var(--border)] bg-gray-100 flex items-center justify-center">
                                            <img src={settings.storeLogo} alt="Store Logo" className="w-full h-full object-cover" />
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setSettings({ ...settings, storeLogo: "" })}
                                            className="text-[9px] font-black uppercase text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            Remove Logo
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl border border-dashed border-[var(--border)] text-gray-500">
                                        <ImageIcon size={20} />
                                        <span className="text-[7px] font-black uppercase tracking-wider mt-1">No Logo</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Payout Details */}
                <section className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-8 shadow-xl shadow-black/5 space-y-6">
                    <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                        <CreditCard className="text-[#ff9900]" size={20} />
                        <h3 className="text-lg font-black uppercase tracking-tight">Payout & Billing Settings</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Merchant UPI Address (UPI ID)</label>
                            <input 
                                type="text" 
                                value={settings.payoutUpi || ""}
                                onChange={(e) => setSettings({ ...settings, payoutUpi: e.target.value })}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-[#ff9900] text-[var(--foreground)]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Receiving Bank Name</label>
                            <input 
                                type="text" 
                                value={settings.payoutBank || ""}
                                onChange={(e) => setSettings({ ...settings, payoutBank: e.target.value })}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-[#ff9900] text-[var(--foreground)]"
                            />
                        </div>
                    </div>
                </section>

                {/* 3. Preferences */}
                <section className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-8 shadow-xl shadow-black/5 space-y-6">
                    <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                        <Bell className="text-[#ff9900]" size={20} />
                        <h3 className="text-lg font-black uppercase tracking-tight">System Preferences</h3>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input 
                                type="checkbox" 
                                checked={!!settings.emailAlerts}
                                onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
                                className="w-5 h-5 rounded border-[var(--border)] bg-[var(--background)] text-[#ff9900] focus:ring-[#ff9900]"
                            />
                            <span className="text-xs font-bold text-gray-300">Notify me via email when farmers place new orders</span>
                        </label>
                        
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input 
                                type="checkbox" 
                                checked={!!settings.pricingNotifications}
                                onChange={(e) => setSettings({ ...settings, pricingNotifications: e.target.checked })}
                                className="w-5 h-5 rounded border-[var(--border)] bg-[var(--background)] text-[#ff9900] focus:ring-[#ff9900]"
                            />
                            <span className="text-xs font-bold text-gray-300">Send dynamic price markup suggestions on Prophet forecast warnings</span>
                        </label>
                    </div>
                </section>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-[var(--border)]">
                    {savedSuccess && (
                        <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-green-500 bg-green-500/10 px-4 py-2.5 rounded-2xl animate-in fade-in duration-300">
                            <CheckCircle size={14} /> Settings Saved Successfully
                        </span>
                    )}
                    <button 
                        type="submit"
                        disabled={isSaving}
                        className="bg-[#ff9900] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : "Save Preferences"}
                    </button>
                </div>
            </form>
        </div>
    );
}
