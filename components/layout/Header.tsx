"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingCart, User, Menu, ChevronDown, Mic, PhoneCall, Heart, Package, Stethoscope, MessageSquare, Newspaper, Award, Plus, Store, LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/common/ThemeToggle";
import LanguageSelector from "@/components/common/LanguageSelector";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";

const Header = ({ showTopBar = true }: { showTopBar?: boolean }) => {
    const router = useRouter();
    const { data: session } = useSession();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);
    const [showMerchantWarning, setShowMerchantWarning] = useState(false);
    const { cartCount, totalAmount, isDarkMode, toggleTheme } = useCart();
    const [wishlistCount, setWishlistCount] = useState(0);
    
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowAccountMenu(false);
            }
        };
        if (showAccountMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showAccountMenu]);

    const handleLogout = async () => {
        try {
            await signOut();
            setShowAccountMenu(false);
            router.push("/");
        } catch (error) {
            console.error("Error logging out:", error);
            window.location.href = "/";
        }
    };

    const megaMenus: Record<string, any> = {
        "Brands": (
            <div className="grid grid-cols-5 gap-x-6 max-w-7xl mx-auto">
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Seeds</h4>
                    <ul className="space-y-2.5 h-[350px] overflow-y-auto no-scrollbar">
                        {["SYNGENTA", "NAMDHARI", "SEMINIS", "EAST WEST", "INDO AMERICAN HYBRID SEEDS", "VNR", "NUNHEMS", "SARPAN", "UPL", "MAHYCO", "KNOWN-YOU", "URJA SEEDS", "ASHOKA", "ADVANTA"].map(s => (
                            <li key={s} className={cn("text-[10px] font-bold hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider", s === "SYNGENTA" ? "text-[#ff9900]" : "text-gray-500")}>{s}</li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Crop Protection</h4>
                    <ul className="space-y-2.5 h-[350px] overflow-y-auto no-scrollbar">
                        {["BAYER", "SYNGENTA", "BASF", "FMC", "RALLIS", "TAPAS", "DHANUKA", "CRYSTAL CROP PROTECTION", "UPL", "CORTEVA", "INDOFIL", "SUMITOMO", "PI INDUSTRIES", "ADAMA"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">{s}</li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Crop Nutrition</h4>
                    <ul className="space-y-2.5 h-[350px] overflow-y-auto no-scrollbar">
                        {["MULTIPLEX", "HIFIELD", "SEA6 ENERGY", "HUMATE INDIA", "MICROBI AGROTECH", "GEOLIFE", "TAPAS", "OTLA", "VEDGNA", "AMRUTH ORGANIC", "SHAMROCK", "ANAND AGRO CARE", "VANPROZ", "AGRIPLEX"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">{s}</li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Implements</h4>
                    <ul className="space-y-2.5 h-[350px] overflow-y-auto no-scrollbar">
                        {["SNAP EXPORT PRIVATE LIMITED", "NIYO FARMTECH PRIVATE LIMITED", "TAPAS", "MITVA", "MIPATEX", "SICKLE INNOVATIONS PVT LTD", "TATA AGRICO", "Modish Tractoraurkisan Pvt Ltd"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">{s}</li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Most Popular</h4>
                    <ul className="space-y-2.5 h-[350px] overflow-y-auto no-scrollbar">
                        {["SYNGENTA", "BAYER", "Excel Industries", "Janatha Agro Products", "NAMDHARI", "GEOLIFE", "BASF", "TAPAS", "VNR", "VANPROZ", "SARPAN", "UAL", "KAN BIOSYS", "KATYAYANI ORGANICS"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">{s}</li>
                        ))}
                    </ul>
                </div>
            </div>
        ),
        "Seeds": (
            <div className="grid grid-cols-4 gap-x-8 max-w-5xl mx-auto">
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Horticulture Crops</h4>
                    <ul className="space-y-3">
                        {["Vegetable & Fruit Seeds", "Fruit Seeds", "Flower Seeds"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">
                                <Link href={`/products?category=${encodeURIComponent(s)}`}>{s}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Field Crops</h4>
                    <ul className="space-y-3">
                        {["Forages", "Maize/Corn", "Paddy", "Mustard", "Jowar", "Cotton"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">{s}</li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Special Category</h4>
                    <ul className="space-y-3">
                        {["Polyhouse", "Exotics", "Forestry", "Urban Garden", "Saplings"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">{s}</li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Popular Products</h4>
                    <ul className="space-y-3">
                        {["Tomato", "Chilli", "Brinjal", "Cucumber", "Cauliflower"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">{s}</li>
                        ))}
                    </ul>
                </div>
            </div>
        ),
        "Crop Protection": (
            <div className="grid grid-cols-4 gap-x-8 max-w-5xl mx-auto">
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Chemical Pesticides</h4>
                    <ul className="space-y-3">
                        {["Insecticides", "Fungicides", "Herbicides", "Bactericides", "Miticides/Acaricides"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">
                                <Link href={`/products?category=${encodeURIComponent(s)}`}>{s}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Bio/Organic Pesticides</h4>
                    <ul className="space-y-3">
                        {["Bio Insecticides", "Bio Fungicides", "Bio Viricides", "Bio Nematicides", "Bio Miticides/Acaricides"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">{s}</li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Traps and Lures</h4>
                    <ul className="space-y-3">
                        {["Sticky Traps", "Pheromone Lures", "Pheromone Traps", "Solar Light Traps"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">{s}</li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Others</h4>
                    <ul className="space-y-3">
                        {["Adjuvants", "Surface Disinfectants", "Decomposers", "Animal Repellant", "Safety Kit", "Safety Shoes"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">{s}</li>
                        ))}
                    </ul>
                </div>
            </div>
        ),
        "Crop Nutrition": (
            <div className="grid grid-cols-4 gap-x-8 max-w-5xl mx-auto">
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Fertilizers</h4>
                    <ul className="space-y-3">
                        {["Chemical Fertilizers", "Bio/Organic Fertilizers", "Micro Nutrients", "Humic Acids", "pH Balancers"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">{s}</li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Growth Promoters</h4>
                    <ul className="space-y-3">
                        {["Plant Growth Promoters", "Plant Enhancers", "Bio Stimulants/Activators"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">
                                <Link href={`/products?category=${encodeURIComponent(s === "Plant Growth Promoters" ? "Growth Promoters" : s)}`}>{s}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Plant Growth Regulators</h4>
                    <ul className="space-y-3">
                        {["Yield Boosters", "Fruit Enhancers", "Flower Boosters"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">{s}</li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Popular</h4>
                    <ul className="space-y-3">
                        {["NPK Fertilizers", "Liquid Fertilizers", "Seaweed Extracts", "Fertilizer Enhancers"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">{s}</li>
                        ))}
                    </ul>
                </div>
            </div>
        ),
        "Equipments": (
            <div className="grid grid-cols-4 gap-x-8 max-w-5xl mx-auto">
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Implements</h4>
                    <ul className="space-y-3">
                        {["Sprayers", "Brush Cutter", "Weeder/Tiller", "Chaff Cutter and Parts", "Solar Dryer", "Rice Mill", "Earth Augers", "Power Reaper", "Chain Saw", "Sugarcane Machine"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">{s}</li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Agriculture Tools</h4>
                    <ul className="space-y-3">
                        {["Nursery Inputs", "Fruit Harvester/ Plucker", "Garden Tools", "Seeder/ Transplanter"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">
                                <Link href={`/products?category=${encodeURIComponent(s === "Seeder/ Transplanter" ? "Farm Machinery" : s)}`}>{s}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Accessories</h4>
                    <ul className="space-y-3">
                        {["Tirpal/ Tarpaulin", "Mulch", "Shade Net", "Traps and Lure", "Safety Kit", "Torch/ Lantern", "Crop Cover"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">{s}</li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Irrigation</h4>
                    <ul className="space-y-3">
                        {["Pipe", "Water Pump", "Sprinkler", "Drip Kit"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">{s}</li>
                        ))}
                    </ul>
                </div>
            </div>
        ),
        "Animal Husbandry": (
            <div className="grid grid-cols-4 gap-x-8 max-w-5xl mx-auto">
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Cattle</h4>
                    <ul className="space-y-3">
                        {["Cattle Feed", "Cattle Supplements", "Milking Machine", "Milking Machine Accessories", "Calf Feeding Bottle"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">
                                <Link href={`/products?category=${encodeURIComponent(s === "Milking Machine" ? "Animal Husbandry" : s)}`}>{s}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Poultry</h4>
                    <ul className="space-y-3">
                        {["Poultry Supplements", "Poultry Equipment"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">{s}</li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Others</h4>
                    <ul className="space-y-3">
                        {["Forage Seeds", "Silage Culture"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">{s}</li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Popular Brands</h4>
                    <ul className="space-y-3">
                        {["Meenakshi Agro", "Ecowealth", "Godhan", "Prompt Equipments", "Agrigators Enterprises", "Shivam Pharma"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">{s}</li>
                        ))}
                    </ul>
                </div>
            </div>
        ),
        "Organic": (
            <div className="grid grid-cols-4 gap-x-8 max-w-5xl mx-auto">
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Bio/Organic Pesticides</h4>
                    <ul className="space-y-3">
                        {["Bio Insecticides", "Bio Fungicides", "Bio Viricides", "Bio Nematicides", "Bio Miticides/Acaricides"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">{s}</li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[#1b6b3e] font-black text-[11px] uppercase tracking-widest border-b border-[#1b6b3e]/20 pb-2">Crop Nutrition</h4>
                    <ul className="space-y-3">
                        {["Bio/Organic Fertilizers", "Bio Stimulants/Activators"].map(s => (
                            <li key={s} className="text-[10px] font-bold text-gray-500 hover:text-[#1b6b3e] cursor-pointer transition-colors uppercase tracking-wider">{s}</li>
                        ))}
                    </ul>
                </div>
            </div>
        )
    };

    useEffect(() => {
        setHasMounted(true);
        const handleScroll = () => {
            const currentScroll = window.scrollY;
            if (currentScroll > 80) {
                setIsScrolled(true);
            } else if (currentScroll < 10) {
                setIsScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (!session?.user?.id) {
            setWishlistCount(0);
            return;
        }

        const fetchWishlistCount = async () => {
            try {
                const res = await fetch(`/api/user/wishlist?userId=${session.user.id}`);
                const data = await res.json();
                if (data.success) {
                    setWishlistCount(data.items?.length || 0);
                }
            } catch (err) {
                console.error("Error fetching wishlist count in header:", err);
            }
        };

        fetchWishlistCount();

        const interval = setInterval(fetchWishlistCount, 5000);
        return () => clearInterval(interval);
    }, [session?.user?.id]);



    // Live Search Logic
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=6`);
                const data = await res.json();
                if (data.success) {
                    setSearchResults(data.data);
                    setShowResults(true);
                }
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
        } else if (e.key === "ArrowUp") {
            setSelectedIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === "Enter" && selectedIndex >= 0) {
            window.location.href = `/product/${searchResults[selectedIndex].id}`;
        }
    };

    return (
        <>
            {/* Top Bar */}
            {showTopBar && (
                <div className={cn(
                    "bg-[var(--background)] border-b border-[var(--border)] px-4 hidden md:block transition-[max-height,padding,opacity] duration-300 ease-in-out overflow-hidden",
                    isScrolled ? "max-h-0 py-0 opacity-0 border-none" : "max-h-12 py-2 opacity-100"
                )}>
                    <div className="container mx-auto flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        <div className="flex gap-8">
                            {session ? (
                                session.user.role === "merchant" || session.user.role === "admin" ? (
                                    <Link href="/merchant" className="hover:text-[#1b6b3e] flex items-center gap-2">Merchant Dashboard</Link>
                                ) : (
                                    <button 
                                        onClick={() => setShowMerchantWarning(true)} 
                                        className="hover:text-[#1b6b3e] flex items-center gap-2 font-black uppercase text-[10px] tracking-widest bg-transparent border-none p-0 cursor-pointer"
                                    >
                                        Sell on Agrinex
                                    </button>
                                )
                            ) : (
                                <Link href="/signup?role=merchant" className="hover:text-[#1b6b3e] flex items-center gap-2">Sell on Agrinex</Link>
                            )}
                        </div>
                        <div className="flex gap-8 items-center">
                            <span className="flex items-center gap-2 text-[#1b6b3e] bg-green-50 dark:bg-green-950/30 px-3 py-1 rounded-full"><PhoneCall size={12} /> Missed Call To Order: 1800-3000-2434</span>
                            <Link href="/help" className="hover:text-[#1b6b3e] flex items-center gap-2">Help Center</Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Header */}
            <header className={cn(
                "sticky top-0 z-[100] w-full transition-[padding,background-color,box-shadow] duration-300 ease-in-out border-b border-[var(--border)]",
                isScrolled 
                    ? "bg-[var(--card)]/90 backdrop-blur-xl py-0 shadow-md" 
                    : "bg-[var(--card)] py-0 shadow-sm"
            )}>
                <div className={cn(
                    "container mx-auto flex items-center justify-between px-4 transition-[height] duration-300 ease-in-out",
                    isScrolled ? "h-16" : "h-20"
                )}>
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <img
                                src="https://res.cloudinary.com/dhpvb2emj/image/upload/q_auto/f_auto/v1778241361/logo.png"
                                alt="Agrinex Logo"
                                className="h-10 md:h-12 w-auto object-contain select-none pointer-events-auto transition-transform group-hover:scale-105"
                                onContextMenu={(e) => e.preventDefault()}
                                draggable="false"
                            />
                        </div>
                        <div className="flex flex-col -space-y-1">
                            <div className="flex items-center gap-1">
                                <span className="text-xl md:text-2xl font-black tracking-tighter text-[#1b6b3e] uppercase">Agrinex</span>
                            </div>
                            <p className="text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] ml-0.5">Digital Marketplace</p>
                        </div>
                    </Link>

                    {/* Search Bar */}
                    <div className="mx-12 flex flex-1 max-w-2xl items-center relative group" onKeyDown={handleKeyDown}>
                        <div className={cn(
                            "flex w-full rounded-2xl border-2 border-[var(--border)] bg-[var(--background)] p-1.5 focus-within:border-[#1b6b3e] focus-within:bg-[var(--card)] transition-all shadow-sm",
                            showResults && "rounded-b-none border-b-0"
                        )}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                                placeholder="Search products or brands..."
                                className="w-full bg-transparent py-2.5 pl-6 pr-12 text-[var(--foreground)] placeholder:text-gray-400 focus:outline-none font-bold text-sm"
                            />
                            <div className="flex gap-2">
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="text-gray-400 hover:text-red-500 transition-colors px-2"
                                    >
                                        ✕
                                    </button>
                                )}
                                <button className="bg-[var(--background)] border border-[var(--border)] text-gray-400 p-3 rounded-xl hover:text-[#ff9900] transition-colors">
                                    <Mic size={20} />
                                </button>
                                <button className="bg-[#1b6b3e] text-white p-3 rounded-xl shadow-lg hover:scale-105 transition-transform">
                                    <Search size={20} strokeWidth={3} />
                                </button>
                            </div>
                        </div>

                        {/* Dynamic Results Dropdown */}
                        <AnimatePresence>
                            {showResults && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 right-0 bg-[var(--card)] border-2 border-t-0 border-[#1b6b3e] rounded-b-2xl shadow-2xl z-[60] overflow-hidden backdrop-blur-xl"
                                >
                                    {isSearching ? (
                                        <div className="p-8 text-center">
                                            <div className="w-6 h-6 border-2 border-[#1b6b3e] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Results...</span>
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <div className="p-2">
                                            <div className="px-4 py-2 border-b border-[var(--border)] mb-2">
                                                <span className="text-[9px] font-black text-[#1b6b3e] uppercase tracking-[0.2em]">Top Matches</span>
                                            </div>
                                            {searchResults.map((product, idx) => (
                                                <Link
                                                    key={product.id}
                                                    href={`/product/${product.id}`}
                                                    className={cn(
                                                        "flex items-center gap-4 p-3 rounded-xl transition-all group",
                                                        selectedIndex === idx ? "bg-[#1b6b3e]/10 translate-x-2" : "hover:bg-[var(--background)] hover:translate-x-1"
                                                    )}
                                                    onClick={() => setShowResults(false)}
                                                >
                                                    <div className="w-12 h-12 rounded-lg bg-[var(--background)] p-1 border border-[var(--border)]">
                                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-black text-[var(--foreground)] line-clamp-1 group-hover:text-[#1b6b3e]">{product.name}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-[#ff9900]">₹{product.price.toLocaleString()}</span>
                                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{product.categories?.name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ChevronDown className="-rotate-90 text-[#1b6b3e]" size={16} />
                                                    </div>
                                                </Link>
                                            ))}
                                            <Link
                                                href={`/products?search=${encodeURIComponent(searchQuery)}`}
                                                className="block text-center py-3 text-[10px] font-black text-[#1b6b3e] uppercase tracking-widest hover:bg-[#1b6b3e]/5 transition-all mt-2 border-t border-[var(--border)]"
                                            >
                                                View All {searchResults.length}+ Results
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center">
                                            <Search size={32} className="mx-auto mb-4 text-gray-300" />
                                            <p className="text-sm font-black text-gray-500 uppercase tracking-tight">No products matching "{searchQuery}"</p>
                                            <p className="text-[10px] font-bold text-gray-400 mt-1">Try a different keyword or brand</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Click outside to close */}
                        {showResults && (
                            <div className="fixed inset-0 z-50 bg-transparent" onClick={() => setShowResults(false)}></div>
                        )}
                    </div>

                    <div className="flex items-center gap-6">
                        <LanguageSelector />
                        <div className="w-px h-6 bg-[var(--border)] hidden md:block"></div>
                        <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} className="hidden md:flex" />

                        <Link href="/user/dashboard/orders" className="hidden xl:flex flex-col items-center gap-1 hover:text-[#1b6b3e] transition-colors group">
                            <Package size={22} className="text-gray-400 group-hover:text-[#1b6b3e]" />
                            <span className="text-[9px] font-black uppercase tracking-tighter">Track Order</span>
                        </Link>

                        <Link href="/user/dashboard/wishlist" className="hidden xl:flex flex-col items-center gap-1 hover:text-[#1b6b3e] transition-colors group">
                            <Heart size={22} className="text-gray-400 group-hover:text-[#1b6b3e]" />
                            <span className="text-[9px] font-black uppercase tracking-tighter">Wishlist</span>
                        </Link>

                        <div className="relative" ref={menuRef}>
                            <div 
                                className="flex items-center gap-3 cursor-pointer hover:text-[#1b6b3e] transition-colors group"
                                onClick={() => setShowAccountMenu(!showAccountMenu)}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-[var(--background)] flex items-center justify-center group-hover:bg-[#1b6b3e]/10 border border-[var(--border)] transition-all overflow-hidden">
                                    {session?.user?.image ? (
                                        <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={24} className="text-gray-500 group-hover:text-[#1b6b3e]" />
                                    )}
                                </div>
                                <div className="hidden lg:flex flex-col">
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                                        {session ? "Welcome Back" : "My Account"}
                                    </span>
                                    <span className="text-sm font-black flex items-center leading-none">
                                        {session ? (session.user.name ? session.user.name.split(' ')[0] : "User") : "Account"}{" "}
                                        <ChevronDown size={14} className={cn("ml-1 transition-transform duration-300", showAccountMenu && "rotate-180")} />
                                    </span>
                                </div>
                            </div>

                            {/* Account Dropdown */}
                            <AnimatePresence>
                                {showAccountMenu && (
                                    <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full right-0 mt-4 w-64 bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl z-[150] overflow-hidden p-2 backdrop-blur-xl"
                                        >
                                            {session ? (
                                                <>
                                                    <div className="p-4 border-b border-[var(--border)] mb-2">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                                                        <p className="text-xs font-bold text-[var(--foreground)] truncate">{session.user.name || session.user.email}</p>
                                                        <span className="inline-block mt-2 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full bg-[#1b6b3e]/10 text-[#1b6b3e] border border-[#1b6b3e]/20">
                                                            {session.user.role || 'customer'}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="space-y-1">
                                                        <Link 
                                                            href={session.user.role === 'admin' ? '/admin/dashboard' : session.user.role === 'merchant' ? '/merchant' : '/user/dashboard'} 
                                                            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#1b6b3e] hover:text-white transition-all group"
                                                            onClick={() => setShowAccountMenu(false)}
                                                        >
                                                            <div className="w-8 h-8 rounded-xl bg-[var(--background)] flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                                                <LayoutDashboard size={16} />
                                                            </div>
                                                            <span className="text-xs font-black uppercase tracking-widest">Dashboard</span>
                                                        </Link>
                                                        <Link 
                                                            href="/profile" 
                                                            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                                                            onClick={() => setShowAccountMenu(false)}
                                                        >
                                                            <div className="w-8 h-8 rounded-xl bg-[var(--background)] flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                                                <User size={16} />
                                                            </div>
                                                            <span className="text-xs font-black uppercase tracking-widest">My Profile</span>
                                                        </Link>
                                                        <button 
                                                            onClick={handleLogout}
                                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-500/10 text-red-500 transition-all group animate-pulse"
                                                        >
                                                            <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                                                                <LogOut size={16} />
                                                            </div>
                                                            <span className="text-xs font-black uppercase tracking-widest">Logout</span>
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="p-4 border-b border-[var(--border)] mb-2">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Welcome to Agrinex</p>
                                                        <p className="text-xs font-bold text-[var(--foreground)]">Access your account or register now.</p>
                                                    </div>
                                                    
                                                    <div className="space-y-1">
                                                        <Link 
                                                            href="/login" 
                                                            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#1b6b3e] hover:text-white transition-all group"
                                                            onClick={() => setShowAccountMenu(false)}
                                                        >
                                                            <div className="w-8 h-8 rounded-xl bg-[var(--background)] flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                                                <User size={16} />
                                                            </div>
                                                            <span className="text-xs font-black uppercase tracking-widest">Login</span>
                                                        </Link>
                                                        <Link 
                                                            href="/signup" 
                                                            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#ff9900] hover:text-white transition-all group"
                                                            onClick={() => setShowAccountMenu(false)}
                                                        >
                                                            <div className="w-8 h-8 rounded-xl bg-[var(--background)] flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                                                <Plus size={16} />
                                                            </div>
                                                            <span className="text-xs font-black uppercase tracking-widest">Sign Up</span>
                                                        </Link>
                                                    </div>

                                                    <div className="mt-4 p-4 bg-[var(--background)] rounded-2xl">
                                                        <Link href="/signup?role=merchant" className="text-[9px] font-black text-[#1b6b3e] uppercase tracking-widest hover:underline flex items-center gap-2">
                                                            <Store size={12} /> Become a Seller
                                                        </Link>
                                                    </div>
                                                </>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                        <Link href="/cart" className="flex items-center gap-3 hover:text-[#1b6b3e] transition-colors group relative">
                            <div className="relative">
                                <ShoppingCart size={28} className="text-black dark:text-white group-hover:text-[#1b6b3e] transition-colors" strokeWidth={2.5} />
                                <span className="absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#b37c3a] text-black text-[11px] font-black border-2 border-[#1a1a1a] shadow-lg">
                                    {hasMounted ? cartCount : 0}
                                </span>
                            </div>
                            <div className="hidden lg:flex flex-col">
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Shopping Cart</span>
                                <span className="text-sm font-black leading-none">₹{hasMounted ? totalAmount.toLocaleString() : "0.00"}</span>
                            </div>
                        </Link>

                        <button className="lg:hidden text-[#1b6b3e] p-3 bg-[var(--background)] rounded-xl">
                            <Menu size={28} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Merchant Warning Pop-up Modal */}
            <AnimatePresence>
                {showMerchantWarning && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] w-full max-w-md p-8 shadow-2xl space-y-6 text-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto">
                                <Store size={32} className="text-[#ff9900]" />
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)]">Account Restriction</h3>
                                <p className="text-xs font-bold text-gray-400 leading-relaxed">
                                    Customer accounts cannot register as merchants. Please sign out of your current account first if you wish to create a digital storefront.
                                </p>
                            </div>
                            
                            <div className="flex gap-4 pt-4 border-t border-[var(--border)]">
                                <button 
                                    onClick={() => setShowMerchantWarning(false)}
                                    className="flex-1 bg-[var(--card)] border border-[var(--border)] text-gray-500 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                >
                                    Go Back
                                </button>
                                <button 
                                    onClick={async () => {
                                        setShowMerchantWarning(false);
                                        await signOut();
                                        router.push("/signup?role=merchant");
                                    }}
                                    className="flex-1 bg-[#ff9900] text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                                >
                                    Log Out & Sign Up
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;
