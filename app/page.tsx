"use client";

import React from "react";
import Header from "@/components/layout/Header";
import CategoryBar from "@/components/home/CategoryBar";
import HeroCarousel from "@/components/home/HeroCarousel";
import ProductSection from "@/components/home/ProductSection";
import Footer from "@/components/layout/Footer";
import CropScanner from "@/components/ai/CropScanner";
import TrendingGrid from "@/components/home/TrendingGrid";
import { PhoneCall, Award, Truck, RefreshCw, Stethoscope, MessageSquare, Newspaper, Zap, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { mlClient } from "@/lib/ml-client";

// SessionStorage cache helpers to persist data across page reloads and dashboard visits
const CACHE_KEY = "agrinex_homepage_cache";

function getCachedData() {
    if (typeof window === "undefined") return null;
    try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        return cached ? JSON.parse(cached) : null;
    } catch (e) {
        return null;
    }
}

function setCachedData(data: any) {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) { }
}

export default function Home() {
    const { data: session } = useSession();
    const [isScannerOpen, setIsScannerOpen] = React.useState(false);
    const [categories, setCategories] = React.useState<any[]>([]);
    const [isLoadingCats, setIsLoadingCats] = React.useState(true);

    // Product States
    const [trendingProducts, setTrendingProducts] = React.useState<any[]>([]);
    const [seedProducts, setSeedProducts] = React.useState<any[]>([]);
    const [nutrientProducts, setNutrientProducts] = React.useState<any[]>([]);
    const [insecticideProducts, setInsecticideProducts] = React.useState<any[]>([]);
    const [machineryProducts, setMachineryProducts] = React.useState<any[]>([]);
    const [kisanNews, setKisanNews] = React.useState<any[]>([]);
    const [govtSchemes, setGovtSchemes] = React.useState<any[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = React.useState(true);

    // Recommendation States
    const [recommendedProducts, setRecommendedProducts] = React.useState<any[]>([]);
    const [isLoadingRecs, setIsLoadingRecs] = React.useState(false);

    React.useEffect(() => {
        const userId = session?.user?.id;
        if (!userId) {
            if (trendingProducts.length > 0) {
                const shuffled = [...trendingProducts].sort(() => 0.5 - Math.random());
                setRecommendedProducts(shuffled.slice(0, 6));
            } else {
                setRecommendedProducts([]);
            }
            return;
        }

        async function fetchRecommendations() {
            setIsLoadingRecs(true);
            try {
                const lastViewedId = typeof window !== "undefined" 
                    ? sessionStorage.getItem("agrinex_last_viewed_product_id") || undefined 
                    : undefined;

                const recData = await mlClient.getRecommendations({ 
                    buyerId: userId, 
                    productId: lastViewedId,
                    topN: 6 
                });
                
                // If SVD returns valid recommendations with details (existing user with orders)
                if (recData && recData.recommended && recData.recommended.length > 0 && recData.recommended.some(item => item.product_name)) {
                    const mapped = recData.recommended.map(item => ({
                        id: item.product_id,
                        name: item.product_name || "Recommended Product",
                        category: item.category || "General",
                        price: item.price || 0,
                        image_url: item.image_url || "",
                    }));
                    setRecommendedProducts(mapped);
                } else {
                    // New User Fallback: Recommend products randomly from the current platform catalog
                    if (trendingProducts.length > 0) {
                        const shuffled = [...trendingProducts].sort(() => 0.5 - Math.random());
                        setRecommendedProducts(shuffled.slice(0, 6));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch homepage personalized recommendations:", err);
                if (trendingProducts.length > 0) {
                    const shuffled = [...trendingProducts].sort(() => 0.5 - Math.random());
                    setRecommendedProducts(shuffled.slice(0, 6));
                }
            } finally {
                setIsLoadingRecs(false);
            }
        }

        fetchRecommendations();
    }, [session?.user?.id, trendingProducts.length]);



    React.useEffect(() => {
        // Safety timeout: If the page gets stuck in a loading state (e.g. BFCache bug or network hang),
        // forcefully turn off skeletons after 3 seconds to reveal the UI and cached data.
        const safetyTimer = setTimeout(() => {
            setIsLoadingCats(false);
            setIsLoadingProducts(false);
        }, 3000);

        // SSR-Safe Cache Hydration: Populate states from sessionStorage cache immediately on mount
        const cache = getCachedData();
        if (cache) {
            setCategories(cache.categories || []);
            setIsLoadingCats(false);
            setTrendingProducts(cache.trendingProducts || []);
            setSeedProducts(cache.seedProducts || []);
            setNutrientProducts(cache.nutrientProducts || []);
            setInsecticideProducts(cache.insecticideProducts || []);
            setMachineryProducts(cache.machineryProducts || []);
            setKisanNews(cache.kisanNews || []);
            setGovtSchemes(cache.govtSchemes || []);
            setIsLoadingProducts(false);
        }

        async function fetchData() {
            try {
                // Fetch Categories
                const catRes = await fetch('/api/categories');
                const catData = await catRes.json();
                let fetchedCategories = [];
                if (catData.success) {
                    fetchedCategories = catData.data;
                    setCategories(fetchedCategories);
                }

                // Fetch Product Sections in parallel
                const [trendingRes, seedsRes, nutrientRes, insecticideRes, machineryRes, newsRes, schemesRes] = await Promise.all([
                    fetch('/api/products?limit=10&sort=created_at'),
                    fetch(`/api/products?category=${encodeURIComponent('Vegetable & Fruit Seeds')}&limit=10`),
                    fetch(`/api/products?category=${encodeURIComponent('Growth Promoters')}&limit=10`),
                    fetch(`/api/products?category=${encodeURIComponent('Insecticides')}&limit=10`),
                    fetch(`/api/products?category=${encodeURIComponent('Farm Machinery')}&limit=10`),
                    fetch('/api/news'),
                    fetch('/api/schemes')
                ]);

                const [trending, seeds, nutrients, insecticides, machinery, news, schemes] = await Promise.all([
                    trendingRes.json(),
                    seedsRes.json(),
                    nutrientRes.json(),
                    insecticideRes.json(),
                    machineryRes.json(),
                    newsRes.json(),
                    schemesRes.json()
                ]);

                const fetchedTrending = trending.data || [];
                const fetchedSeeds = seeds.data || [];
                const fetchedNutrients = nutrients.data || [];
                const fetchedInsecticides = insecticides.data || [];
                const fetchedMachinery = machinery.data || [];
                const fetchedNews = news.data || [];
                const fetchedSchemes = schemes.data || [];

                setTrendingProducts(fetchedTrending);
                setSeedProducts(fetchedSeeds);
                setNutrientProducts(fetchedNutrients);
                setInsecticideProducts(fetchedInsecticides);
                setMachineryProducts(fetchedMachinery);
                setKisanNews(fetchedNews);
                setGovtSchemes(fetchedSchemes);

                // Cache the fetched data for future visits (survives page reloads & layout shifts)
                setCachedData({
                    categories: fetchedCategories,
                    trendingProducts: fetchedTrending,
                    seedProducts: fetchedSeeds,
                    nutrientProducts: fetchedNutrients,
                    insecticideProducts: fetchedInsecticides,
                    machineryProducts: fetchedMachinery,
                    kisanNews: fetchedNews,
                    govtSchemes: fetchedSchemes
                });

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoadingCats(false);
                setIsLoadingProducts(false);
                clearTimeout(safetyTimer);
            }
        }

        fetchData();
    }, []);

    // 1. Debounced scroll tracking to save exact user position
    React.useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        const handleScroll = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                sessionStorage.setItem("agrinex_homepage_scroll_y", window.scrollY.toString());
            }, 100); // 100ms debounce
        };
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(timeoutId);
        };
    }, []);

    // 2. Exact scroll restoration after page assets and dynamic sections finish loading
    React.useEffect(() => {
        if (!isLoadingProducts && !isLoadingCats) {
            const savedScroll = sessionStorage.getItem("agrinex_homepage_scroll_y");
            if (savedScroll) {
                const scrollY = parseInt(savedScroll, 10);
                // Tiny timeout to let next.js DOM render state completely settle
                const timer = setTimeout(() => {
                    window.scrollTo(0, scrollY);
                }, 80);
                return () => clearTimeout(timer);
            }
        }
    }, [isLoadingProducts, isLoadingCats]);

    const categoryStyles: Record<string, { color: string; fallbackIcon: string }> = {
        'Offers': { fallbackIcon: "🎁", color: "bg-orange-50 dark:bg-orange-500/10 dark:border-orange-500/30 dark:shadow-[0_0_30px_rgba(249,115,22,0.05)]" },
        'Vegetable & Fruit Seeds': { fallbackIcon: "🌾", color: "bg-green-50 dark:bg-green-500/10 dark:border-green-500/30 dark:shadow-[0_0_30px_rgba(34,197,94,0.05)]" },
        'Flower Seeds': { fallbackIcon: "🌸", color: "bg-pink-50 dark:bg-pink-500/10 dark:border-pink-500/30 dark:shadow-[0_0_30px_rgba(236,72,153,0.05)]" },
        'Insecticides': { fallbackIcon: "🦟", color: "bg-red-50 dark:bg-red-500/10 dark:border-red-500/30 dark:shadow-[0_0_30px_rgba(239,68,68,0.05)]" },
        'Fungicides': { fallbackIcon: "🍄", color: "bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/30 dark:shadow-[0_0_30px_rgba(245,158,11,0.05)]" },
        'Herbicides': { fallbackIcon: "🌿", color: "bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:shadow-[0_0_30px_rgba(16,185,129,0.05)]" },
        'Nutrients': { fallbackIcon: "🌱", color: "bg-blue-50 dark:bg-blue-500/10 dark:border-blue-500/30 dark:shadow-[0_0_30px_rgba(59,130,246,0.05)]" },
        'Growth Promoters': { fallbackIcon: "🧪", color: "bg-purple-50 dark:bg-purple-500/10 dark:border-purple-500/30 dark:shadow-[0_0_30px_rgba(168,85,247,0.05)]" },
        'Farm Machinery': { fallbackIcon: "🚜", color: "bg-gray-50 dark:bg-slate-500/10 dark:border-slate-500/30 dark:shadow-[0_0_30px_rgba(100,116,139,0.05)]" },
        'Urban Gardening': { fallbackIcon: "🪴", color: "bg-lime-50 dark:bg-lime-500/10 dark:border-lime-500/30 dark:shadow-[0_0_30px_rgba(132,204,22,0.05)]" },
        'Animal Husbandry': { fallbackIcon: "🐄", color: "bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/30 dark:shadow-[0_0_30px_rgba(244,63,94,0.05)]" },
        'Mango Crop Needs': { fallbackIcon: "🥭", color: "bg-yellow-50 dark:bg-yellow-500/10 dark:border-yellow-500/30 dark:shadow-[0_0_30px_rgba(234,179,8,0.05)]" },
    };

    return (
        <main className="min-h-screen flex flex-col bg-[var(--background)] transition-colors duration-500">
            <Header />
            <CropScanner isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />

            <div className="flex-1 pb-20">
                <HeroCarousel />

                {/* Flash Deals Ticker */}
                <div className="bg-[#ff9900] text-white py-2.5 overflow-hidden whitespace-nowrap shadow-sm">
                    <div className="flex animate-scroll gap-24 font-black text-xs items-center uppercase tracking-widest">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center gap-3">
                                <Zap size={14} fill="white" />
                                <span>Missed Call To Order: 1800-3000-2434</span>
                                <Zap size={14} fill="white" />
                                <span>Up to 60% Off on Vegetable Seeds</span>
                                <Zap size={14} fill="white" />
                                <span>Free Shipping on orders above ₹999</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Shop By Category Grid */}
                <section className="container mx-auto px-4 py-12">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-[#1b6b3e] rounded-full"></div>
                            <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)]">Shop By Category</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 justify-items-center max-w-7xl mx-auto">
                        {isLoadingCats ? (
                            Array(10).fill(0).map((_, i) => (
                                <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gray-100 dark:bg-gray-800"></div>
                                    <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
                                </div>
                            ))
                        ) : (
                            categories
                                .sort((a, b) => (a.name === 'Offers' ? -1 : b.name === 'Offers' ? 1 : 0))
                                .map((cat) => {
                                    const style = categoryStyles[cat.name] || { fallbackIcon: "🌱", color: "bg-green-50 dark:bg-green-950/30" };
                                    return (
                                        <Link
                                            key={cat.id}
                                            href={`/products?category=${encodeURIComponent(cat.name)}`}
                                            className="flex flex-col items-center gap-3 group cursor-pointer"
                                        >
                                            <div className={cn(
                                                "w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] flex items-center justify-center text-6xl group-hover:scale-105 transition-all shadow-sm border border-[var(--border)] group-hover:shadow-2xl overflow-hidden backdrop-blur-xl relative",
                                                style.color
                                            )}>
                                                {/* Inner glow for dark mode */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                                {cat.image_url ? (
                                                    <div className="relative z-10 w-24 h-24 md:w-32 md:h-32 flex items-center justify-center p-2">
                                                        {/* Subtle background for the image box to soften the white edges */}
                                                        <div className="absolute inset-2 bg-white/5 dark:bg-white/10 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        <img
                                                            src={cat.image_url}
                                                            alt={cat.name}
                                                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 dark:brightness-[1.05] dark:contrast-[1.1]"
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="relative z-10 drop-shadow-xl">{style.fallbackIcon}</span>
                                                )}
                                            </div>
                                            <div className="text-center">
                                                <span className="text-sm md:text-base font-black text-[var(--foreground)] uppercase tracking-[0.15em] group-hover:text-[#1b6b3e] transition-colors block leading-tight">{cat.name}</span>
                                            </div>
                                        </Link>
                                    );
                                })
                        )}
                    </div>
                </section>

                {/* Advisory Section */}
                <section className="bg-[var(--card)] py-16 border-y border-[var(--border)] transition-colors duration-500">
                    <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="text-[#ff9900] font-black uppercase tracking-[0.3em] text-xs">Agri Intelligence</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-[var(--foreground)] leading-[1.1]">The Smart<br />Agri Center</h2>
                            <p className="text-lg text-gray-500 dark:text-gray-400 font-bold max-w-lg leading-relaxed">
                                Leverage cutting-edge agriculture technology for instant crop diagnosis and 24/7 expert farming guidance tailored to your soil.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <button
                                    onClick={() => setIsScannerOpen(true)}
                                    className="bg-[#1b6b3e] text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all flex items-center gap-3"
                                >
                                    <Stethoscope size={24} /> Crop Diagnosis
                                </button>
                                <Link href="/chat">
                                    <button className="bg-[var(--card)] border-2 border-[var(--border)] text-[var(--foreground)] px-8 py-4 rounded-2xl font-black text-lg hover:border-[#1b6b3e] hover:text-[#1b6b3e] transition-all flex items-center gap-3">
                                        <MessageSquare size={24} /> Ask Agrinex Assistant
                                    </button>
                                </Link>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-green-50 dark:bg-green-950/20 p-8 rounded-[40px] flex flex-col justify-between min-h-64 border border-green-100/50 dark:border-green-900/30 overflow-hidden relative group">
                                <div className="flex items-center justify-end">
                                    <span className="bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest animate-pulse">Live</span>
                                </div>
                                <div className="space-y-2 mt-4 flex-1">
                                    <h4 className="text-xl font-black text-[var(--foreground)] mb-1">Kisan News</h4>
                                    {kisanNews.length > 0 ? (
                                        <a
                                            href={kisanNews[0].link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block group-hover:translate-x-1 transition-transform"
                                        >
                                            {kisanNews[0].image && (
                                                <div className="w-full h-35 rounded-2xl overflow-hidden mb-3 border border-green-100 dark:border-green-900/50">
                                                    <img src={kisanNews[0].image} alt="" className="w-full h-full object-cover object-[center_10%] group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                            )}
                                            <p className="text-sm font-bold text-[var(--foreground)] leading-tight line-clamp-3 mb-2 mt-3">{kisanNews[0].title}</p>
                                            <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{new Date(kisanNews[0].pubDate).toLocaleDateString()}</p>
                                        </a>
                                    ) : (
                                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Fetching latest schemes & updates...</p>
                                    )}
                                </div>
                                {kisanNews.length > 1 && (
                                    <div className="mt-4 border-t border-green-100 dark:border-green-900/50 pt-4">
                                        <p className="text-[10px] font-black text-gray-700 dark:text-gray-400 uppercase tracking-[0.2em] mb-2">More Updates</p>
                                        <div className="h-10 overflow-hidden relative">
                                            <div className="animate-vertical-scroll">
                                                {[...kisanNews.slice(1, 5), ...kisanNews.slice(1, 5)].map((news, i) => (
                                                    <a key={i} href={news.link} target="_blank" rel="noopener noreferrer" className="block text-[11px] font-bold text-[var(--foreground)] hover:text-[#1b6b3e] mb-2 truncate">
                                                        • {news.title}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-950/20 p-8 rounded-[40px] flex flex-col justify-between min-h-64 border border-orange-100/50 dark:border-orange-900/30 overflow-hidden relative group">
                                <div className="flex items-center justify-end">
                                    <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">Official</span>
                                </div>
                                <div className="space-y-2 mt-4 flex-1">
                                    <h4 className="text-xl font-black text-[var(--foreground)] mb-1">Government Schemes</h4>
                                    {govtSchemes.length > 0 ? (
                                        <a
                                            href={govtSchemes[0].link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block group-hover:translate-x-1 transition-transform"
                                        >
                                            <div className="w-full h-40 rounded-2xl overflow-hidden mb-3 border border-orange-100 dark:border-orange-900/50 relative">
                                                <img
                                                    src={govtSchemes[0].image || "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800&auto=format&fit=crop"}
                                                    alt=""
                                                    className="w-full h-full object-cover object-[center_10%] group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                            </div>
                                            <p className="text-sm font-bold text-[var(--foreground)] leading-tight line-clamp-3 mb-2">{govtSchemes[0].title}</p>
                                            <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{new Date(govtSchemes[0].pubDate).toLocaleDateString()}</p>
                                        </a>
                                    ) : (
                                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Loading latest benefits...</p>
                                    )}
                                </div>
                                {govtSchemes.length > 1 && (
                                    <div className="mt-4 border-t border-orange-100 dark:border-orange-900/50 pt-4">
                                        <p className="text-[10px] font-black text-gray-700 dark:text-gray-400 uppercase tracking-[0.2em] mb-2">Recent Benefits</p>
                                        <div className="h-10 overflow-hidden relative">
                                            <div className="animate-vertical-scroll">
                                                {[...govtSchemes.slice(1, 5), ...govtSchemes.slice(1, 5)].map((scheme, i) => (
                                                    <a key={i} href={scheme.link} target="_blank" rel="noopener noreferrer" className="block text-[11px] font-bold text-[var(--foreground)] hover:text-[#ff9900] mb-2 truncate">
                                                        • {scheme.title}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <ProductSection title="Today's Offer" products={trendingProducts.slice(0, 5)} isLoading={isLoadingProducts} categoryName="Offers" />

                {(isLoadingRecs || recommendedProducts.length > 0) && (
                    <ProductSection 
                        title="Recommended For You" 
                        products={recommendedProducts} 
                        isLoading={isLoadingRecs} 
                        categoryName="Offers"
                    />
                )}

                {/* Promotional Banner */}
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-gradient-to-br from-[#1b6b3e] to-[#0a2e1a] rounded-[50px] p-12 md:p-16 text-white flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden border-8 border-white/5 group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')] opacity-5"></div>
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-green-400/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

                        <div className="z-10 text-center md:text-left md:max-w-xl">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-8 hover:bg-white/20 transition-all cursor-default">
                                <span className="w-2 h-2 bg-orange-400 rounded-full animate-ping"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-orange-100">Special Seasonal Offer</span>
                            </div>
                            <h3 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-none">
                                Mahadhan <br />
                                <span className="text-orange-400 italic">Vegetable</span> Special
                            </h3>
                            <p className="text-lg md:text-xl font-bold text-white/70 mb-10 leading-relaxed">
                                Boost your crop yield with premium nutrition. Specially formulated for
                                <span className="text-white px-2">Tomato, Chilli, Beans & Brinjal</span>.
                            </p>
                            <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start">
                                <button className="bg-[#ff9900] text-white px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-[0_20px_50px_rgba(255,153,0,0.3)] flex items-center gap-3 active:scale-95 group/btn">
                                    Shop Collection
                                    <ChevronRight className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                                <div className="text-left">
                                    <p className="text-3xl font-black text-white">Flat 20% OFF</p>
                                    <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Limited Period Only</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 w-full md:w-1/2 flex justify-center items-center">
                            <div className="absolute inset-0 bg-orange-400/20 blur-[120px] rounded-full scale-75 animate-pulse"></div>
                            <img
                                src="/mahadhan-promo.png"
                                alt="Mahadhan Vegetable Special"
                                className="w-[300px] md:w-[450px] drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] z-10 animate-float transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                    </div>
                </div>

                <ProductSection title="High Quality Hybrid Seeds" products={seedProducts} isLoading={isLoadingProducts} categoryName="Vegetable & Fruit Seeds" />

                {/* Brands Section */}
                <section className="container mx-auto px-4 py-20">
                    <div className="flex flex-col items-center text-center mb-16">
                        <span className="text-[#1b6b3e] font-black uppercase tracking-[0.4em] text-xs mb-4">Our Partners</span>
                        <h2 className="text-4xl font-black text-[var(--foreground)]">Featured Brands</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
                        {[
                            { name: "Syngenta", slug: "syngentaLogo.webp", logo: "🌿", color: "text-green-600", bg: "bg-green-50" },
                            { name: "Neptune", slug: "download.jpg", logo: "🔱", color: "text-blue-500", bg: "bg-blue-50" },
                            { name: "Multiplex", slug: "multiplexLogo.webp", logo: "💠", color: "text-purple-500", bg: "bg-purple-50" },
                            { name: "Bayer", slug: "bayerLogo.webp", logo: "🟢", color: "text-emerald-500", bg: "bg-emerald-50" },
                            { name: "Indam", slug: "indoAmericanLogo.webp", logo: "🇮🇳", color: "text-orange-500", bg: "bg-orange-50" },
                            { name: "Geolife", slug: "geolife-brand-logo.webp", logo: "🌍", color: "text-lime-600", bg: "bg-lime-50" },
                            { name: "Barrix", slug: "barrixLogo.webp", logo: "🛡️", color: "text-cyan-600", bg: "bg-cyan-50" },
                            { name: "Dhanuka", slug: "dhanukaLogo.webp", logo: "🏹", color: "text-red-600", bg: "bg-red-50" },
                        ].map((brand) => (
                            <Link
                                key={brand.name}
                                href={`/products?search=${encodeURIComponent(brand.name)}`}
                                className="bg-[var(--card)] rounded-3xl p-6 flex flex-col items-center justify-center border border-[var(--border)] shadow-sm hover:shadow-2xl transition-all group cursor-pointer hover:-translate-y-2 duration-500"
                            >
                                <div className={cn("w-20 h-20 md:w-24 md:h-24 mb-3 flex items-center justify-center rounded-2xl text-5xl group-hover:scale-125 transition-all duration-500 overflow-hidden", brand.bg, brand.color)}>
                                    <img
                                        src={`https://res.cloudinary.com/dhpvb2emj/image/upload/f_auto,q_auto/v1/${brand.slug}`}
                                        alt={brand.name}
                                        className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
                                        onError={(e) => {
                                            // Fallback to symbol if image not found
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            if (target.parentElement) {
                                                target.parentElement.innerHTML = brand.logo;
                                            }
                                        }}
                                    />
                                </div>
                                <span className="font-black text-[10px] md:text-xs text-[var(--foreground)] uppercase tracking-widest group-hover:text-[#1b6b3e] transition-colors">{brand.name}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                <ProductSection title="Essential Growth Promoters" products={nutrientProducts} isLoading={isLoadingProducts} categoryName="Growth Promoters" />
                <ProductSection title="Trusted Insecticides" products={insecticideProducts} isLoading={isLoadingProducts} categoryName="Insecticides" />
                <ProductSection title="Advanced Farming Tools & Machinery" products={machineryProducts} isLoading={isLoadingProducts} categoryName="Farm Machinery" />

                {/* Knowledge Blogs */}
                <section className="container mx-auto px-4 pb-20">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-black text-[var(--foreground)]">Agriculture Knowledge Center</h2>
                        <Link href="#" className="text-[#1b6b3e] font-black uppercase tracking-widest text-xs flex items-center gap-1 hover:underline">
                            Read All Blogs <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { 
                                title: "Managing Black Thrips in Chilli", 
                                date: "May 10, 2026", 
                                cat: "Crop Protection", 
                                image: "/chilli_farming.png",
                                link: "/blog/chilli-thrips"
                            },
                            { 
                                title: "Organic Farming: Government Subsidies", 
                                date: "May 08, 2026", 
                                cat: "Schemes", 
                                image: "/organic_farming.png",
                                link: "/blog/organic-subsidies"
                            },
                            { 
                                title: "Paddy Harvesting: Best Practices", 
                                date: "May 05, 2026", 
                                cat: "Machinery", 
                                image: "/paddy_harvesting.png",
                                link: "/blog/paddy-harvesting"
                            },
                        ].map((blog, i) => (
                            <Link 
                                key={i} 
                                href={blog.link}
                                className="bg-[var(--card)] rounded-3xl overflow-hidden border border-[var(--border)] group cursor-pointer hover:shadow-xl transition-all block"
                            >
                                <div className="h-48 overflow-hidden relative border-b border-[var(--border)]">
                                    <img 
                                        src={blog.image} 
                                        alt={blog.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                </div>
                                <div className="p-6">
                                    <span className="text-[10px] font-black text-[#ff9900] uppercase tracking-widest mb-2 block">{blog.cat}</span>
                                    <h4 className="text-lg font-black text-[var(--foreground)] mb-4 group-hover:text-[#1b6b3e] transition-colors leading-snug">{blog.title}</h4>
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-400 border-t border-[var(--border)] pt-4">
                                        <span>{blog.date}</span>
                                        <span className="text-[#1b6b3e]">Read More</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <TrendingGrid products={trendingProducts} />
            </div>

            <Footer />
        </main>
    );
}