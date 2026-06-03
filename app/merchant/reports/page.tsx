"use client";
import React, { useState, useEffect } from "react";
import { PieChart, Download, FileText, Calendar, TrendingUp, ArrowDown, ArrowUp, BarChart2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export default function MerchantReports() {
    const [category, setCategory] = useState("Insecticides");
    const [days, setDays] = useState(30);
    const [forecastData, setForecastData] = useState<any[]>([]);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getSeason = (cat: string) => {
        const kharif = ["Insecticides", "Herbicides", "Vegetable & Fruit Seeds", "Farm Machinery"];
        const rabi = ["Fungicides", "Flower Seeds", "Growth Promoters", "Nutrients"];
        const zaid = ["Mango Crop Needs", "Urban Gardening"];
        if (kharif.includes(cat)) return "kharif";
        if (rabi.includes(cat)) return "rabi";
        if (zaid.includes(cat)) return "zaid";
        return "perennial";
    };

    const season = getSeason(category);
    let forecastColor = "#8ac43f"; // default green
    let bandColor = "rgba(138, 196, 63, 0.15)";
    if (season === "rabi") {
        forecastColor = "#3b82f6"; // blue
        bandColor = "rgba(59, 130, 246, 0.15)";
    } else if (season === "zaid") {
        forecastColor = "#ff9900"; // orange
        bandColor = "rgba(255, 153, 0, 0.15)";
    } else if (season === "perennial") {
        forecastColor = "#888888"; // gray
        bandColor = "rgba(136, 136, 136, 0.15)";
    }

    const getSeasonDetails = (seasonName: string) => {
        switch (seasonName) {
            case "rabi":
                return {
                    label: "Rabi • Oct – Feb",
                    colorClass: "text-blue-500 bg-blue-500/10 border-blue-500/20",
                    status: "Starts in 4 months"
                };
            case "zaid":
                return {
                    label: "Zaid • Mar – Jun",
                    colorClass: "text-orange-500 bg-orange-500/10 border-orange-500/20",
                    status: "Active now — 90% through season"
                };
            case "perennial":
                return {
                    label: "Perennial • All Year",
                    colorClass: "text-gray-500 bg-gray-500/10 border-gray-500/20",
                    status: "Constant demand flow"
                };
            case "kharif":
            default:
                return {
                    label: "Kharif • Jun – Sep",
                    colorClass: "text-green-500 bg-green-500/10 border-green-500/20",
                    status: "Active now — 3% through season"
                };
        }
    };

    const seasonDetails = getSeasonDetails(season);

    useEffect(() => {
        const fetchForecast = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`/api/ai/ml?type=forecast&category=${encodeURIComponent(category)}&days=${days}`);
                const json = await res.json();
                if (json.success && json.data?.forecast) {
                    setForecastData(json.data.forecast);
                    setHistoryData(json.data.history || []);
                } else {
                    setError(json.error || "Forecast model output not found. Please verify the Python backend is running.");
                }
            } catch (err) {
                setError("Failed to connect to ML backend server.");
            } finally {
                setLoading(false);
            }
        };
        fetchForecast();
    }, [category, days]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">Business Reports</h1>
                    <p className="text-xs font-bold text-gray-400">Export data and analyze your store's growth.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-black text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-gray-900 transition-all shadow-xl">
                        <Calendar size={16} /> Last Quarter
                    </button>
                    <button className="bg-[#ff9900] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20">
                        <Download size={16} /> Export All
                    </button>
                </div>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-8 shadow-xl shadow-black/5">
                    <h3 className="text-lg font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                        <TrendingUp className="text-green-500" size={24} /> Revenue Streams
                    </h3>
                    <div className="space-y-6">
                        {[
                            { label: "Product Sales", amount: "₹1,85,000", percent: 75, color: "bg-[#ff9900]" },
                            { label: "Services", amount: "₹42,500", percent: 18, color: "bg-[#1b6b3e]" },
                            { label: "Shipping Fees", amount: "₹18,390", percent: 7, color: "bg-blue-500" },
                        ].map((item, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                                    <span className="text-gray-500">{item.label}</span>
                                    <span>{item.amount}</span>
                                </div>
                                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.percent}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-8 shadow-xl shadow-black/5">
                    <h3 className="text-lg font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                        <PieChart className="text-[#ff9900]" size={24} /> Sales by Category
                    </h3>
                    <div className="flex items-center justify-center h-48 relative">
                        {/* Mock Donut Chart */}
                        <div className="w-40 h-40 rounded-full border-[16px] border-orange-500 border-t-green-500 border-l-blue-500 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
                                <p className="text-lg font-black">₹2.4M</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        <div className="text-center">
                            <div className="w-2 h-2 rounded-full bg-orange-500 mx-auto mb-1"></div>
                            <p className="text-[8px] font-black text-gray-400 uppercase">Seeds</p>
                            <p className="text-[10px] font-black">62%</p>
                        </div>
                        <div className="text-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 mx-auto mb-1"></div>
                            <p className="text-[8px] font-black text-gray-400 uppercase">Tools</p>
                            <p className="text-[10px] font-black">24%</p>
                        </div>
                        <div className="text-center">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mx-auto mb-1"></div>
                            <p className="text-[8px] font-black text-gray-400 uppercase">Fertilizer</p>
                            <p className="text-[10px] font-black">14%</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* AI Demand Forecasting Section */}
            <section className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-8 shadow-xl shadow-black/5 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border)] pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-[#ff9900]">
                            <BarChart2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tighter">Seasonal demand forecast</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Prophet model • {category.toLowerCase().includes("vegetable") || category.toLowerCase().includes("fruit") || category.toLowerCase().includes("seed") ? "Rabi season" : "Kharif season"} • ADF stationarity tested
                            </p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-[#ff9900]" size={36} />
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Running prediction models...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-16 border-2 border-dashed border-[var(--border)] rounded-[32px] p-6 space-y-2">
                        <p className="text-sm font-black uppercase tracking-wider text-red-500">⚠️ {error}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Make sure Python FastAPI is running at http://localhost:5000
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Selector Controls inside card body */}
                        <div className="space-y-4 bg-[var(--background)] border border-[var(--border)] p-8 rounded-3xl">
                            {/* Big Dropdown Select */}
                            <div className="relative max-w-sm">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl px-6 py-4 font-black text-sm uppercase focus:outline-none focus:border-[#ff9900] transition-all cursor-pointer"
                                >
                                    <optgroup label="Kharif (Jun - Sep)" className="font-black text-gray-500 bg-[var(--card)] not-uppercase">
                                        <option value="Insecticides">Insecticides</option>
                                        <option value="Herbicides">Herbicides</option>
                                        <option value="Vegetable & Fruit Seeds">Veg & Fruit Seeds</option>
                                        <option value="Farm Machinery">Farm Machinery</option>
                                    </optgroup>
                                    <optgroup label="Rabi (Oct - Feb)" className="font-black text-gray-500 bg-[var(--card)] not-uppercase">
                                        <option value="Fungicides">Fungicides</option>
                                        <option value="Flower Seeds">Flower Seeds</option>
                                        <option value="Growth Promoters">Growth Promoters</option>
                                        <option value="Nutrients">Nutrients</option>
                                    </optgroup>
                                    <optgroup label="Zaid / Summer (Mar - Jun)" className="font-black text-gray-500 bg-[var(--card)] not-uppercase">
                                        <option value="Mango Crop Needs">Mango Crop Needs</option>
                                        <option value="Urban Gardening">Urban Gardening</option>
                                    </optgroup>
                                    <optgroup label="Perennial (All year)" className="font-black text-gray-500 bg-[var(--card)] not-uppercase">
                                        <option value="Animal Husbandry">Animal Husbandry</option>
                                    </optgroup>
                                </select>
                            </div>

                            {/* Horizon Selector pills (30d, 60d, 90d) */}
                            <div className="flex items-center gap-3">
                                {[30, 60, 90].map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => setDays(d)}
                                        className={cn(
                                            "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all cursor-pointer",
                                            days === d 
                                                ? "bg-green-500/10 border-green-500/30 text-green-500" 
                                                : "bg-[var(--card)] border-[var(--border)] text-gray-400 hover:text-white"
                                        )}
                                    >
                                        {d}d
                                    </button>
                                ))}
                            </div>

                            {/* Season indicator sublabel */}
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest mt-1">
                                <span className={cn("px-2.5 py-0.5 rounded border", seasonDetails.colorClass)}>
                                    {seasonDetails.label}
                                </span>
                                <span className="text-gray-400">
                                    {seasonDetails.status}
                                </span>
                            </div>
                        </div>

                        {/* Forecast Stats Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-3xl bg-[var(--background)] border border-[var(--border)]">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg Projected Daily Sales</p>
                                <p className="text-2xl font-black text-[#ff9900]">
                                    ₹{(forecastData.reduce((acc, curr) => acc + curr.yhat, 0) / forecastData.length).toFixed(1)}
                                </p>
                            </div>
                            <div className="p-6 rounded-3xl bg-[var(--background)] border border-[var(--border)]">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Peak Demand Projection</p>
                                <p className="text-2xl font-black text-green-500">
                                    ₹{Math.max(...forecastData.map(d => d.yhat)).toFixed(1)}
                                </p>
                            </div>
                            <div className="p-6 rounded-3xl bg-[var(--background)] border border-[var(--border)]">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Model Confidence Range</p>
                                <p className="text-2xl font-black text-blue-500">±15%</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Demand Forecast Projection</h3>
                            </div>
                            <div className="h-[380px] w-full bg-[var(--background)] border border-[var(--border)] p-6 rounded-[32px] overflow-hidden shadow-inner relative flex flex-col justify-between">
                                <div className="relative w-full h-[300px] min-h-[300px]">
                                    {mounted && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart 
                                            data={[
                                                ...historyData.map((h: any, idx: number) => {
                                                    const isLast = idx === historyData.length - 1;
                                                    return {
                                                        date: new Date(h.ds).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
                                                        actual: h.y,
                                                        forecast: isLast ? h.y : null,
                                                        lower: isLast ? h.y : null,
                                                        upper: isLast ? h.y : null,
                                                        range: isLast ? [h.y, h.y] : null
                                                    };
                                                }),
                                                ...forecastData.map((f: any) => ({
                                                    date: new Date(f.ds).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
                                                    actual: null,
                                                    forecast: f.yhat,
                                                    lower: f.yhat_lower,
                                                    upper: f.yhat_upper,
                                                    range: [f.yhat_lower, f.yhat_upper]
                                                }))
                                            ]} 
                                            margin={{ top: 20, right: 10, left: -25, bottom: 0 }}
                                        >
                                            <defs>
                                                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8ac43f" stopOpacity={0.15}/>
                                                    <stop offset="95%" stopColor="#8ac43f" stopOpacity={0.01}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.7} />
                                            <XAxis 
                                                dataKey="date" 
                                                stroke="var(--muted)" 
                                                tickLine={false}
                                                style={{ fontSize: '9px', fontWeight: '900' }} 
                                            />
                                            <YAxis 
                                                stroke="var(--muted)" 
                                                tickLine={false}
                                                domain={['auto', 'auto']}
                                                style={{ fontSize: '9px', fontWeight: '900' }} 
                                            />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: 'var(--card)', 
                                                    borderColor: 'var(--border)', 
                                                    borderRadius: '12px',
                                                    fontSize: '11px',
                                                    color: 'var(--foreground)',
                                                    fontWeight: 'bold',
                                                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                                }} 
                                                itemStyle={{ color: 'var(--foreground)' }}
                                                labelStyle={{ color: 'var(--muted)' }}
                                                formatter={(value: any, name?: any) => {
                                                    if (name === "actual") return [`${value} units`, "Actual"];
                                                    if (name === "forecast") return [`${value} units`, "Forecast"];
                                                    if (name === "upper") return [`${value} units`, "Upper"];
                                                    if (name === "lower") return [`${value} units`, "Lower"];
                                                    return [value, name || ""];
                                                }}
                                            />
                                            {/* Shaded Confidence Interval */}
                                            <Area 
                                                type="monotone" 
                                                dataKey="range" 
                                                stroke="none" 
                                                fill={bandColor} 
                                                activeDot={false} 
                                                name="range" 
                                                tooltipType="none"
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="upper" 
                                                stroke="none" 
                                                fill="none" 
                                                activeDot={false} 
                                                name="upper" 
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="lower" 
                                                stroke="none" 
                                                fill="none" 
                                                activeDot={false} 
                                                name="lower" 
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="actual" 
                                                stroke="#8ac43f" 
                                                strokeWidth={3} 
                                                fill="none" 
                                                connectNulls={true}
                                                name="actual" 
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="forecast" 
                                                stroke={forecastColor} 
                                                strokeWidth={3} 
                                                strokeDasharray="4 4"
                                                fill="none" 
                                                connectNulls={true}
                                                name="forecast" 
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                    )}
                                </div>
 
                                {/* Custom Legend and Metadata at the bottom */}
                                <div className="flex justify-between items-center pt-4 border-t border-[var(--border)] text-[10px] font-black uppercase tracking-wider">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5 text-[#8ac43f]"><span className="w-3 h-0.5 bg-[#8ac43f]"></span> Actual (past 60 days)</span>
                                        <span className="flex items-center gap-1.5" style={{ color: forecastColor }}><span className="w-3 h-0.5 border-t-2 border-dashed" style={{ borderColor: forecastColor }}></span> Forecast</span>
                                        <span className="flex items-center gap-1.5 text-[var(--muted)]"><span className="w-3 h-2 bg-[var(--background)] border border-dashed border-[var(--border)] rounded"></span> Confidence band</span>
                                    </div>
                                    <span className="text-[var(--muted)] lowercase font-bold tracking-normal">
                                        prophet_{category.toLowerCase().replace(/ & /g, '_and_').replace(/ /g, '_')}.pkl
                                    </span>
                                </div>
                            </div>

                            {/* Dynamic Seasonality indicators at bottom */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                        {category.toLowerCase().includes("vegetable") || category.toLowerCase().includes("fruit") || category.toLowerCase().includes("seed") ? "Rabi Season Active" : "Kharif Season Active"}
                                    </span>
                                    <span className="text-[9px] font-bold text-gray-400">Demand index and seasonality weights per month:</span>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
                                    {[
                                        { label: "Jan", val: 39, months: [9, 10, 11, 0, 1] },
                                        { label: "Feb", val: 39, months: [9, 10, 11, 0, 1] },
                                        { label: "Mar", val: 50, months: [2, 3, 4, 5] },
                                        { label: "Apr", val: 61, months: [2, 3, 4, 5] },
                                        { label: "May", val: 72, months: [2, 3, 4, 5] },
                                        { label: "Jun", val: 89, months: [5, 6, 7, 8] },
                                        { label: "Jul", val: 100, months: [5, 6, 7, 8] },
                                        { label: "Aug", val: 83, months: [5, 6, 7, 8] },
                                        { label: "Sep", val: 61, months: [5, 6, 7, 8] },
                                        { label: "Oct", val: 44, months: [9, 10, 11, 0, 1] },
                                        { label: "Nov", val: 39, months: [9, 10, 11, 0, 1] },
                                        { label: "Dec", val: 33, months: [9, 10, 11, 0, 1] },
                                    ].map((m, idx) => {
                                        const catLower = category.toLowerCase();
                                        const isRabiActive = catLower.includes("vegetable") || catLower.includes("fruit") || catLower.includes("seed");
                                        const isMangoActive = catLower.includes("mango");
                                        
                                        let isActive = false;
                                        if (isRabiActive) {
                                            isActive = m.months.includes(9) && m.months.includes(0); // Rabi months
                                        } else if (isMangoActive) {
                                            isActive = m.months.includes(2); // Mango crop
                                        } else {
                                            isActive = m.months.includes(5) && m.months.includes(8); // Kharif months
                                        }

                                        return (
                                            <div 
                                                key={idx} 
                                                className={cn(
                                                    "p-3 rounded-xl border text-center transition-all",
                                                    isActive 
                                                        ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400 font-black shadow-sm" 
                                                        : "bg-gray-100/50 dark:bg-gray-800/30 border-[var(--border)] text-gray-400 font-bold"
                                                )}
                                            >
                                                <p className="text-[9px] uppercase tracking-wider mb-0.5">{m.label}</p>
                                                <p className="text-xs">{m.val}%</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Recent Reports List */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-8 shadow-xl shadow-black/5">

                <h3 className="text-xl font-black uppercase tracking-tighter mb-8">Generated Reports</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { title: "Monthly Sales Summary", date: "May 1, 2026", type: "PDF", size: "2.4 MB" },
                        { title: "Inventory Audit Log", date: "April 28, 2026", type: "XLS", size: "1.2 MB" },
                        { title: "Customer Engagement Data", date: "April 15, 2026", type: "CSV", size: "4.8 MB" },
                        { title: "Tax Compliance Report", date: "April 1, 2026", type: "PDF", size: "1.1 MB" },
                    ].map((report, i) => (
                        <div key={i} className="p-6 rounded-3xl bg-[var(--background)] border border-[var(--border)] hover:border-[#ff9900]/30 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#ff9900] transition-colors">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-tight">{report.title}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{report.date} • {report.type}</p>
                                </div>
                            </div>
                            <button className="p-3 hover:bg-[#ff9900]/10 rounded-xl transition-all text-gray-400 hover:text-[#ff9900]">
                                <Download size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
