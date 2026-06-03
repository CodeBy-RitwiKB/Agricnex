"use client";
import React, { useState, useEffect, useRef } from "react";
import { Server, Globe, Cpu, Save, RefreshCw, Loader2, User, Camera, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminConfig() {
    // Config states
    const [config, setConfig] = useState<any>({
        maintenanceMode: false,
        commission: 5,
        announcement: "",
        maxImageSize: 5,
        apiCacheDuration: 3600
    });
    // Profile states
    const [profile, setProfile] = useState<any>({
        name: "",
        image: "",
        phoneNumber: "",
        address: "",
        email: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Crop Modal States
    const [showCropModal, setShowCropModal] = useState(false);
    const [selectedImageSrc, setSelectedImageSrc] = useState("");
    const [imageAspect, setImageAspect] = useState(1);
    const [zoom, setZoom] = useState(1);
    const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchData = async () => {
        try {
            const [configRes, profileRes] = await Promise.all([
                fetch("/api/admin/config"),
                fetch("/api/admin/profile")
            ]);
            const configJson = await configRes.json();
            const profileJson = await profileRes.json();

            if (configJson.success) {
                setConfig(configJson.config);
            }
            if (profileJson.success) {
                setProfile(profileJson.user || {});
            }
        } catch (err) {
            setError("Failed to connect to administration APIs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApplyChanges = async () => {
        setSaving(true);
        setSuccessMessage("");
        setError("");
        try {
            const res = await fetch("/api/admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            });
            const json = await res.json();
            if (json.success) {
                setSuccessMessage("System parameters applied and cached successfully!");
                setTimeout(() => setSuccessMessage(""), 4000);
            } else {
                setError(json.error || "Failed to update configs.");
            }
        } catch (err) {
            setError("Could not establish connection to write configurations.");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        setSuccessMessage("");
        setError("");
        try {
            const res = await fetch("/api/admin/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile)
            });
            const json = await res.json();
            if (json.success) {
                setProfile(json.user);
                setSuccessMessage("Admin profile updated successfully!");
                setTimeout(() => setSuccessMessage(""), 4000);
            } else {
                setError(json.error || "Failed to update profile.");
            }
        } catch (err) {
            setError("Could not establish connection to save profile details.");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                setError("Please select an image smaller than 4MB.");
                setTimeout(() => setError(""), 4000);
                return;
            }
            const reader = new FileReader();
            reader.onload = (uploadEvent) => {
                const base64 = uploadEvent.target?.result as string;
                
                const img = new Image();
                img.src = base64;
                img.onload = () => {
                    setImageAspect(img.width / img.height);
                    setSelectedImageSrc(base64);
                    setZoom(1);
                    setCropOffset({ x: 0, y: 0 });
                    setShowCropModal(true);
                };
            };
            reader.readAsDataURL(file);
        }
    };

    // Drag handlers for cropping box
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({
            x: e.clientX - cropOffset.x,
            y: e.clientY - cropOffset.y
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setCropOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({
            x: touch.clientX - cropOffset.x,
            y: touch.clientY - cropOffset.y
        });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        setCropOffset({
            x: touch.clientX - dragStart.x,
            y: touch.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const applyCrop = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = new Image();
        img.src = selectedImageSrc;
        img.onload = () => {
            const targetSize = 250;
            canvas.width = targetSize;
            canvas.height = targetSize;

            ctx.clearRect(0, 0, targetSize, targetSize);
            ctx.save();
            
            // Shift coordinates system to center of canvas
            ctx.translate(targetSize / 2, targetSize / 2);
            
            // Map 200px crop circle in 288px container to 250px canvas
            const scaleFactor = targetSize / 200;
            ctx.scale(zoom * scaleFactor, zoom * scaleFactor);
            ctx.translate(cropOffset.x / zoom, cropOffset.y / zoom);

            // Compute sizing details
            let drawWidth = 288;
            let drawHeight = 288;
            if (imageAspect >= 1) {
                drawWidth = 288 * imageAspect;
            } else {
                drawHeight = 288 / imageAspect;
            }

            ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
            ctx.restore();

            const croppedBase64 = canvas.toDataURL("image/jpeg", 0.9);
            setProfile({ ...profile, image: croppedBase64 });
            setShowCropModal(false);
        };
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-48 gap-4">
                <Loader2 className="animate-spin text-cyan-500" size={48} />
                <p className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-white/40">Querying platform environment...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase mb-1">Core Config</h1>
                    <p className="text-xs font-bold text-gray-500 dark:text-white/40">Manage global system parameters and platform infrastructure.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-gray-500 hover:text-[var(--foreground)] transition-all text-[10px] font-black uppercase shadow-sm">
                        <RefreshCw size={14} /> System Reboot
                    </button>
                    <button 
                        onClick={handleApplyChanges}
                        disabled={saving}
                        className="bg-cyan-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-cyan-600 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="animate-spin" size={18} /> Applying...
                            </>
                        ) : (
                            <>
                                <Save size={18} /> Apply Changes
                            </>
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-xs font-black uppercase tracking-wider">
                    ⚠️ {error}
                </div>
            )}

            {successMessage && (
                <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-3xl text-green-500 text-xs font-black uppercase tracking-wider animate-bounce">
                    ✅ {successMessage}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Infrastructure and System Health */}
                <div className="lg:col-span-1 space-y-8">
                    <section className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-8 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-white/30 mb-8 flex items-center gap-2 text-[var(--foreground)]">
                            <Server size={16} /> Infrastructure
                        </h3>
                        <div className="space-y-6">
                            {[
                                { label: "Main Database", status: "Operational", color: "text-green-500" },
                                { label: "Asset Storage", status: "Operational", color: "text-green-500" },
                                { label: "Search Engine", status: "Processing", color: "text-blue-500" },
                                { label: "Email SMTP", status: "Operational", color: "text-green-500" },
                            ].map((s, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-500 dark:text-white/50">{s.label}</span>
                                    <span className={cn("text-[9px] font-black uppercase tracking-widest", s.color)}>{s.status}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-8 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-white/30 mb-8 flex items-center gap-2 text-[var(--foreground)]">
                            <Cpu size={16} /> System Health
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1 text-[var(--foreground)]">
                                <span>CPU Usage</span>
                                <span>14%</span>
                            </div>
                            <div className="h-2 w-full bg-[var(--input)] border border-[var(--border)] rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 w-[14%]"></div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Landscape Admin Profile followed by Global Parameters */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Landscape Admin Profile */}
                    <section className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-10 shadow-sm">
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-10 flex items-center gap-3 text-[var(--foreground)]">
                            <User className="text-cyan-500" size={24} /> Admin Profile Settings
                        </h3>
                        
                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center gap-4 shrink-0">
                                <div 
                                    onClick={handleAvatarClick}
                                    className="w-28 h-28 rounded-full border-4 border-cyan-500 overflow-hidden bg-[var(--input)] flex items-center justify-center shadow-lg relative group cursor-pointer"
                                    title="Click to upload profile photo"
                                >
                                    {profile.image ? (
                                        <img src={profile.image} alt="Admin Profile" className="w-full h-full object-cover transition-opacity group-hover:opacity-75" />
                                    ) : (
                                        <User size={48} className="text-gray-400 transition-opacity group-hover:opacity-75" />
                                    )}
                                    {/* Upload overlay */}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                        <Camera className="text-white" size={20} />
                                    </div>
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    accept="image/*" 
                                    className="hidden" 
                                />
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30 truncate max-w-[150px]">{profile.email || "admin@agrinex.com"}</p>
                            </div>
                            
                            {/* Form Input Fields (Landscape 2-Column Grid) */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-[0.2em] ml-2">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={profile.name || ""} 
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="w-full bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] rounded-2xl py-4 px-6 text-sm font-bold focus:border-cyan-500 outline-none transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-[0.2em] ml-2">Avatar URL / Data</label>
                                    <input 
                                        type="text" 
                                        value={profile.image || ""} 
                                        onChange={(e) => setProfile({ ...profile, image: e.target.value })}
                                        className="w-full bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] rounded-2xl py-4 px-6 text-sm font-bold focus:border-cyan-500 outline-none transition-all truncate" 
                                        placeholder="Paste image URL or click preview circle to upload"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-[0.2em] ml-2">Phone Number</label>
                                    <input 
                                        type="text" 
                                        value={profile.phoneNumber || ""} 
                                        onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                                        className="w-full bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] rounded-2xl py-4 px-6 text-sm font-bold focus:border-cyan-500 outline-none transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-[0.2em] ml-2">Location Address</label>
                                    <input 
                                        type="text" 
                                        value={profile.address || ""} 
                                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                        className="w-full bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] rounded-2xl py-4 px-6 text-sm font-bold focus:border-cyan-500 outline-none transition-all" 
                                    />
                                </div>
                                
                                <div className="md:col-span-2 flex justify-end">
                                    <button 
                                        onClick={handleSaveProfile}
                                        disabled={savingProfile}
                                        className="bg-cyan-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-cyan-600 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50"
                                    >
                                        {savingProfile ? (
                                            <>
                                                <Loader2 className="animate-spin" size={18} /> Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} /> Save Profile
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Global Parameters */}
                    <section className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-10 shadow-sm">
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-10 flex items-center gap-3 text-[var(--foreground)]">
                            <Globe className="text-cyan-500" size={24} /> Global Parameters
                        </h3>
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-[0.2em] ml-4">Maintenance Mode</label>
                                    <div 
                                        onClick={() => setConfig({ ...config, maintenanceMode: !config.maintenanceMode })}
                                        className="bg-[var(--input)] border border-[var(--border)] rounded-2xl p-4 flex justify-between items-center text-[var(--foreground)] cursor-pointer hover:border-cyan-500/30 transition-all select-none"
                                    >
                                        <span className="text-xs font-bold">{config.maintenanceMode ? "ACTIVE" : "OFF"}</span>
                                        <div className={cn(
                                            "w-10 h-6 rounded-full relative p-1 transition-colors duration-300",
                                            config.maintenanceMode ? "bg-cyan-500" : "bg-gray-200 dark:bg-white/10"
                                        )}>
                                            <div className={cn(
                                                "w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm",
                                                config.maintenanceMode ? "translate-x-4" : "translate-x-0"
                                            )}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-[0.2em] ml-4">Merchant Commission (%)</label>
                                    <input 
                                        type="number" 
                                        value={config.commission} 
                                        onChange={(e) => setConfig({ ...config, commission: e.target.value })}
                                        className="w-full bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] rounded-2xl py-4 px-6 text-sm font-bold focus:border-cyan-500 outline-none transition-all" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-[0.2em] ml-4">Platform Announcement Bar</label>
                                <textarea 
                                    value={config.announcement}
                                    onChange={(e) => setConfig({ ...config, announcement: e.target.value })}
                                    className="w-full bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] rounded-2xl py-4 px-6 text-sm font-bold focus:border-cyan-500 outline-none transition-all resize-none" 
                                    rows={2} 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-[0.2em] ml-4">Max Image Upload Size (MB)</label>
                                    <input 
                                        type="number" 
                                        value={config.maxImageSize}
                                        onChange={(e) => setConfig({ ...config, maxImageSize: e.target.value })}
                                        className="w-full bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] rounded-2xl py-4 px-6 text-sm font-bold focus:border-cyan-500 outline-none transition-all" 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-[0.2em] ml-4">API Cache Duration (Sec)</label>
                                    <input 
                                        type="number" 
                                        value={config.apiCacheDuration}
                                        onChange={(e) => setConfig({ ...config, apiCacheDuration: e.target.value })}
                                        className="w-full bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] rounded-2xl py-4 px-6 text-sm font-bold focus:border-cyan-500 outline-none transition-all" 
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Custom Image Cropper Modal */}
            {showCropModal && (
                <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-8 max-w-md w-full shadow-2xl space-y-6 text-[var(--foreground)] animate-in scale-in duration-300">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                                <Camera size={18} className="text-cyan-500" /> Crop Profile Photo
                            </h3>
                            <button 
                                onClick={() => setShowCropModal(false)}
                                className="p-2 hover:bg-[var(--input)] rounded-full text-gray-400 hover:text-[var(--foreground)] transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Drag the image to reposition it, and use the slider below to zoom. Only the area inside the circle will be saved.
                        </p>

                        {/* Interactive Cropper Window */}
                        <div 
                            className="relative w-72 h-72 mx-auto bg-gray-950 rounded-3xl overflow-hidden cursor-move select-none border border-[var(--border)] shadow-inner"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleMouseUp}
                        >
                            {selectedImageSrc && (
                                <img 
                                    src={selectedImageSrc} 
                                    alt="To Crop" 
                                    className="absolute max-w-none pointer-events-none transition-transform duration-75 origin-center"
                                    style={{
                                        width: imageAspect >= 1 ? `${288 * imageAspect}px` : "288px",
                                        height: imageAspect < 1 ? `${288 / imageAspect}px` : "288px",
                                        left: "50%",
                                        top: "50%",
                                        transform: `translate(-50%, -50%) translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${zoom})`
                                    }}
                                />
                            )}
                            
                            {/* Circle Mask Overlay */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="w-[200px] h-[200px] rounded-full border-2 border-cyan-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]" />
                            </div>
                        </div>

                        {/* Zoom Control */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <span className="flex items-center gap-1.5"><ZoomIn size={12} /> Scale / Zoom</span>
                                <span>{Math.round(zoom * 100)}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="4" 
                                step="0.05" 
                                value={zoom} 
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="w-full accent-cyan-500 bg-[var(--input)] border border-[var(--border)] rounded-lg appearance-none h-2 cursor-pointer"
                            />
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex gap-4 pt-2">
                            <button 
                                onClick={() => setShowCropModal(false)}
                                className="flex-1 bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[var(--border)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={applyCrop}
                                className="flex-1 bg-cyan-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/20"
                            >
                                Apply Crop
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
