"use client";

import React, { useState, useEffect, useRef } from "react";
import { Settings, User, Shield, Bell, MapPin, Camera, Save, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function UserSettings() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Form fields state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [image, setImage] = useState("");
    
    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    // Sync session details to form fields
    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || "");
            setEmail(session.user.email || "");
            setPhone(session.user.phoneNumber || "");
            setAddress(session.user.address || "");
            setImage(session.user.image || "");
        }
    }, [session]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveStatus("idle");
        try {
            let finalImageUrl = image;

            // If a new image was selected (base64 data url), upload it to Cloudinary first
            if (image && image.startsWith("data:")) {
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ file: image }),
                });
                const uploadData = await uploadRes.json();
                if (uploadData.success) {
                    finalImageUrl = uploadData.url;
                    setImage(uploadData.url);
                } else {
                    throw new Error(uploadData.error || "Image upload failed");
                }
            }

            // Update user in DB
            const updateRes = await fetch("/api/user", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: session?.user?.id,
                    name,
                    phoneNumber: phone,
                    address,
                    image: finalImageUrl,
                }),
            });
            const updateData = await updateRes.json();
            if (!updateRes.ok || !updateData.success) {
                throw new Error(updateData.error || "Failed to update profile");
            }

            setSaveStatus("success");
            // Reload page to refresh the session token / navbar globally
            setTimeout(() => {
                window.location.reload();
            }, 600);
        } catch (err: any) {
            console.error("Save error:", err);
            setSaveStatus("error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (confirmText !== "DELETE") return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/user?userId=${session?.user?.id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                // Clear session local storage & state
                await signOut();
                setShowDeleteModal(false);
                router.replace("/");
            } else {
                alert(data.error || "Failed to delete account. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred while deleting your account.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (isPending) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="animate-spin text-[#1b6b3e]" size={36} />
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading user preferences...</p>
            </div>
        );
    }

    const initials = name ? name.split(" ").map(n => n[0]).join("") : "U";

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">Account Settings</h1>
                <p className="text-xs font-bold text-gray-400">Manage your profile, security, and preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Profile Photo & Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                    <section className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-8 shadow-xl shadow-black/5 text-center">
                        <div className="relative w-32 h-32 mx-auto mb-6 group">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleImageChange} 
                            />
                            <div className="w-full h-full rounded-[40px] overflow-hidden border-4 border-[#1b6b3e]/20 group-hover:border-[#1b6b3e] transition-all duration-500 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                {image ? (
                                    <img src={image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-black text-gray-400">{initials}</span>
                                )}
                            </div>
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-[#1b6b3e] text-white flex items-center justify-center shadow-xl border-4 border-[var(--card)] group-hover:scale-110 transition-transform cursor-pointer"
                            >
                                <Camera size={18} />
                            </button>
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight">{name || "Agrinex User"}</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
                            {session?.user?.role || "Customer"}
                        </p>
                        <div className="flex justify-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-[#1b6b3e]/10 text-[#1b6b3e] text-[8px] font-black uppercase tracking-widest">Verified</span>
                        </div>
                    </section>

                    {/* Dangerous Zone Section */}
                    <section className="bg-[var(--card)] border border-red-500/20 rounded-[40px] p-8 shadow-xl shadow-black/5">
                        <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <AlertTriangle size={14} /> Danger Zone
                        </h4>
                        <p className="text-[11px] font-bold text-gray-400 mb-6 leading-relaxed">
                            Once you delete your account, there is no going back. All transaction records and details will be permanently wiped.
                        </p>
                        <button 
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 border border-red-500/20 transition-all"
                        >
                            <Trash2 size={14} /> Delete Account
                        </button>
                    </section>
                </div>

                {/* Right: Personal Details Form */}
                <div className="lg:col-span-2">
                    <section className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-10 shadow-xl shadow-black/5">
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                            <User className="text-[#1b6b3e]" size={24} /> Personal Information
                        </h3>
                        
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-[#1b6b3e] transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                                    <input 
                                        type="email" 
                                        disabled
                                        value={email} 
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-sm font-bold opacity-60 cursor-not-allowed" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-[#1b6b3e] transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Preferred Language</label>
                                    <select className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-[#1b6b3e] transition-all appearance-none">
                                        <option>English</option>
                                        <option>Hindi (हिन्दी)</option>
                                        <option>Punjabi (ਪੰਜਾਬੀ)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                                    <MapPin size={12} /> Shipping Address
                                </label>
                                <textarea 
                                    rows={3} 
                                    value={address} 
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-[#1b6b3e] transition-all resize-none"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
                                <button 
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full md:w-fit bg-[#1b6b3e] text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-[#145230] transition-all shadow-xl shadow-[#1b6b3e]/20"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={18} />} 
                                    Save Changes
                                </button>
                                {saveStatus === "success" && (
                                    <span className="text-[10px] font-black uppercase text-green-500 animate-pulse">Changes saved successfully!</span>
                                )}
                            </div>
                        </form>
                    </section>
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] w-full max-w-md p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-500">
                            <AlertTriangle size={32} />
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)]">Permanently Delete Account</h3>
                            <p className="text-xs font-bold text-gray-400 leading-relaxed">
                                This action is irreversible. All of your personal details, order logs, and listings will be completely deleted from our database.
                            </p>
                        </div>

                        <div className="space-y-2 text-left bg-[var(--background)] p-4 rounded-2xl border border-[var(--border)]">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">Type "DELETE" to confirm:</label>
                            <input 
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="DELETE"
                                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-red-500 text-[var(--foreground)]"
                            />
                        </div>
                        
                        <div className="flex gap-4 pt-4 border-t border-[var(--border)]">
                            <button 
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setConfirmText("");
                                }}
                                className="flex-1 bg-[var(--card)] border border-[var(--border)] text-gray-500 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteAccount}
                                disabled={confirmText !== "DELETE" || isDeleting}
                                className="flex-1 bg-red-500 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                            >
                                {isDeleting && <Loader2 className="animate-spin" size={14} />}
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
