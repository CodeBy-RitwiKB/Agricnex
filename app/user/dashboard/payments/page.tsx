"use client";
import React, { useState, useEffect } from "react";
import { CreditCard, Plus, ShieldCheck, History, Download, ExternalLink, Calendar, Loader2, CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

interface PaymentMethod {
  id: string;
  type: string;
  provider: string;
  last4: string | null;
  is_default: boolean;
}

interface Transaction {
  id: string;
  title: string;
  amount: string;
  status: string;
  date: string;
}

export default function UserPayments() {
    const { data: session, isPending: sessionLoading } = useSession();
    const user = session?.user;

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [provider, setProvider] = useState("Visa");
    const [last4, setLast4] = useState("");
    const [isDefault, setIsDefault] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`/api/user/payments?userId=${user.id}`);
            const data = await res.json();
            if (data.success) {
                setPaymentMethods(data.paymentMethods || []);
                setTransactions(data.transactions || []);
            }
        } catch (err) {
            console.error("Error fetching payment methods:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.id]);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleAddCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;
        if (last4.length !== 4 || isNaN(Number(last4))) {
            alert("Please enter exactly 4 digits");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/user/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    type: provider === "UPI" ? "UPI" : "Card",
                    provider,
                    last4,
                    isDefault,
                }),
            });
            const data = await res.json();
            if (data.success) {
                showToast("Payment method added successfully!");
                setShowModal(false);
                setLast4("");
                setIsDefault(false);
                fetchData();
            }
        } catch (err) {
            console.error("Failed to add card:", err);
        } finally {
            setSaving(false);
        }
    };

    if (sessionLoading || loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-[#1b6b3e] animate-spin" />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading billing data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {toastMessage && (
                <div className="fixed bottom-8 right-8 z-50 bg-[#1b6b3e] text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CheckCircle size={16} />
                    {toastMessage}
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">Billing & Payments</h1>
                    <p className="text-xs font-bold text-gray-400">Manage your payment methods and transaction history.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-[#1b6b3e] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-[#145230] transition-all shadow-xl shadow-[#1b6b3e]/20 group"
                >
                    <Plus size={18} className="transition-transform group-hover:rotate-90" />
                    Add Payment Method
                </button>
            </div>

            {/* Saved Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {paymentMethods.length === 0 ? (
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-10 flex flex-col justify-center items-center gap-4 col-span-2">
                        <CreditCard size={36} className="text-gray-300" />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No payment methods saved</p>
                    </div>
                ) : (
                    paymentMethods.map((card, i) => {
                        const isVisa = card.provider.toLowerCase() === "visa";
                        const isUPI = card.provider.toLowerCase() === "upi";
                        const cardColor = isVisa 
                            ? "from-[#1b6b3e] to-[#145230]" 
                            : isUPI 
                            ? "from-blue-600 to-indigo-800" 
                            : "from-gray-800 to-black";

                        return (
                            <div key={card.id} className={cn(
                                "relative h-56 rounded-[40px] p-10 text-white shadow-2xl overflow-hidden group transition-all hover:scale-[1.02]",
                                "bg-gradient-to-br", cardColor
                            )}>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <CreditCard size={32} />
                                        {card.is_default && (
                                            <span className="bg-white/20 backdrop-blur-md text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/20">Primary</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black tracking-[0.2em] mb-4">
                                            {isUPI ? `UPI ID: ****@${card.provider.toLowerCase()}` : `**** **** **** ${card.last4 || '0000'}`}
                                        </p>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[8px] font-black text-white/50 uppercase tracking-widest">Method Type</p>
                                                <p className="text-sm font-black">{card.type.toUpperCase()}</p>
                                            </div>
                                            <p className="text-xl font-black italic">{card.provider}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Transaction History */}
            <section className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-8 shadow-xl shadow-black/5">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <History size={24} />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tighter">Payment History</h2>
                    </div>
                </div>

                <div className="space-y-4">
                    {transactions.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No transaction history found</p>
                        </div>
                    ) : (
                        transactions.map((txn, i) => (
                            <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-[var(--background)] border border-[var(--border)] hover:border-[#1b6b3e]/30 transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-[#1b6b3e] transition-colors">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-tight">{txn.title}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{txn.id} • {txn.date}</p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-8">
                                    <div>
                                        <p className="text-sm font-black text-[#1b6b3e] mb-1">{txn.amount}</p>
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                            txn.status === "Success" ? "bg-green-500/10 text-green-500" :
                                            txn.status === "Failed" ? "bg-red-500/10 text-red-500" :
                                            "bg-orange-500/10 text-orange-500"
                                        )}>{txn.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Modal for adding payment method */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 border border-[var(--border)] rounded-[40px] p-10 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-300 text-gray-800 dark:text-gray-100">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-black dark:hover:text-white"
                        >
                            <X size={24} />
                        </button>
                        
                        <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">Add Payment Method</h2>
                        
                        <form onSubmit={handleAddCard} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Provider</label>
                                <select 
                                    value={provider} 
                                    onChange={(e) => setProvider(e.target.value)}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-[#1b6b3e] text-gray-800 dark:text-gray-100"
                                >
                                    <option value="Visa">Visa</option>
                                    <option value="Mastercard">Mastercard</option>
                                    <option value="Rupay">Rupay</option>
                                    <option value="UPI">UPI</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                    {provider === "UPI" ? "Last 4 Digits of Phone (for verification)" : "Last 4 Digits of Card Number"}
                                </label>
                                <input 
                                    type="text" 
                                    maxLength={4}
                                    placeholder="1234"
                                    value={last4}
                                    onChange={(e) => setLast4(e.target.value)}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-[#1b6b3e] text-gray-800 dark:text-gray-100"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input 
                                    type="checkbox" 
                                    id="defaultMethod"
                                    checked={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                    className="w-5 h-5 rounded-md accent-[#1b6b3e]"
                                />
                                <label htmlFor="defaultMethod" className="text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer select-none">
                                    Set as primary payment method
                                </label>
                            </div>

                            <button 
                                type="submit" 
                                disabled={saving}
                                className="w-full bg-[#1b6b3e] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#145230] transition-all flex justify-center items-center gap-2"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : "Save Payment Method"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
