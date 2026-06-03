"use client";
import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Search, Phone, Mail, MessageSquare, ArrowRight, BookOpen, Truck, HelpCircle, ShieldAlert, BadgeInfo, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    category: "Orders & Delivery",
    icon: Truck,
    questions: [
      { q: "How long does shipping take?", a: "Standard delivery takes 3-5 business days depending on your region. Agricultural equipment may take 5-7 business days." },
      { q: "Can I change my shipping address after placing an order?", a: "You can change your shipping address within 2 hours of placing the order by navigating to your Orders Dashboard or calling our support line." },
      { q: "How do I track my order?", a: "Go to your User Dashboard and click 'Track Order'. You will see the live progress of your shipment." }
    ]
  },
  {
    category: "Payments & Refunds",
    icon: ShieldAlert,
    questions: [
      { q: "What payment methods do you accept?", a: "We accept all major Credit/Debit Cards, Rupay, UPI (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD)." },
      { q: "How long does a refund take?", a: "Refunds are processed within 24 hours of cancellation. The amount will reflect in your bank account or card statement within 5-7 business days." }
    ]
  },
  {
    category: "Farmer Assistance",
    icon: BadgeInfo,
    questions: [
      { q: "Do you offer expert advice on seed selection?", a: "Yes! Agrinex has certified agronomists available for free consultations. Call our support number or use the chat assistant to request a callback." },
      { q: "Are the seeds certified?", a: "All seeds listed on Agrinex are 100% certified by government-authorized seed agencies and verified partners for high-yield performance." }
    ]
  }
];

export default function HelpSupport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Support Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
    setTimeout(() => {
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setSubmitted(false);
    }, 4000);
  };

  const filteredFaqs = faqs
    .filter(cat => activeCategory === "All" || cat.category === activeCategory)
    .map(cat => ({
      ...cat,
      questions: cat.questions.filter(
        faq => faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
               faq.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }))
    .filter(cat => cat.questions.length > 0);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header showTopBar={true} />

      <main className="max-w-7xl mx-auto px-4 py-12 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Hero Section */}
        <section className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-[#1b6b3e] to-[#145230] p-12 text-white shadow-2xl text-center">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Agrinex Help Center</h1>
            <p className="text-white/80 font-bold text-sm md:text-base leading-relaxed">
              Find answers to your questions, connect with agricultural experts, and get technical help. How can we support your farming today?
            </p>
            
            <div className="relative group max-w-xl mx-auto">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1b6b3e] transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search FAQs, orders, seeds..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-gray-800 focus:outline-none shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* Support Options Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Agronomist Helpline", desc: "Speak with agriculture advisors.", info: "1800-3000-2434", icon: Phone, color: "text-[#1b6b3e] bg-green-500/10" },
            { title: "Email Support", desc: "Write to us anytime.", info: "support@agrinex.com", icon: Mail, color: "text-blue-500 bg-blue-500/10" },
            { title: "Live Chat Assistant", desc: "Chat with our virtual helper.", info: "Active 24/7", icon: MessageSquare, color: "text-[#ff9900] bg-orange-500/10" }
          ].map((opt, i) => (
            <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-[45px] p-8 shadow-xl shadow-black/5 flex flex-col justify-between hover:scale-[1.02] transition-transform">
              <div className="space-y-4">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", opt.color)}>
                  <opt.icon size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">{opt.title}</h3>
                  <p className="text-xs font-bold text-gray-400 mt-1">{opt.desc}</p>
                </div>
              </div>
              <p className="text-base font-black text-[#1b6b3e] tracking-tight mt-6">{opt.info}</p>
            </div>
          ))}
        </section>

        {/* FAQ Categories Selection */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1b6b3e]/10 flex items-center justify-center text-[#1b6b3e]">
              <BookOpen size={24} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Frequently Asked Questions</h2>
          </div>

          <div className="flex flex-wrap gap-4">
            {["All", "Orders & Delivery", "Payments & Refunds", "Farmer Assistance"].map((cat, i) => (
              <button 
                key={i} 
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                  activeCategory === cat ? "bg-[#1b6b3e] text-white border-[#1b6b3e]" : "bg-[var(--card)] border-[var(--border)] text-gray-500 hover:border-[#1b6b3e]/30"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredFaqs.length === 0 ? (
              <div className="col-span-2 text-center py-10 bg-[var(--card)] border border-[var(--border)] rounded-[40px]">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No FAQs matched your query</p>
              </div>
            ) : (
              filteredFaqs.map((cat, i) => (
                <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-[45px] p-8 shadow-xl shadow-black/5 space-y-6">
                  <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                    <cat.icon size={20} className="text-[#1b6b3e]" />
                    <h3 className="font-black uppercase tracking-tight text-sm text-[#1b6b3e]">{cat.category}</h3>
                  </div>
                  <div className="space-y-6">
                    {cat.questions.map((q, idx) => (
                      <div key={idx} className="space-y-2">
                        <p className="text-sm font-black flex gap-2"><HelpCircle size={16} className="text-[#ff9900] shrink-0 mt-0.5" /> {q.q}</p>
                        <p className="text-xs text-gray-500 font-bold leading-relaxed pl-6">{q.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Contact Support Ticket Form */}
        <section className="bg-[var(--card)] border border-[var(--border)] rounded-[45px] p-8 md:p-12 shadow-xl shadow-black/5 max-w-3xl mx-auto">
          <div className="text-center max-w-md mx-auto mb-8 space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tighter">Submit Support Ticket</h2>
            <p className="text-xs font-bold text-gray-400">Can't find what you are looking for? Send us a ticket and our managers will respond within 4 hours.</p>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
              <CheckCircle size={56} className="text-[#1b6b3e] animate-bounce" />
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">Ticket Submitted Successfully</h3>
                <p className="text-xs font-bold text-gray-400 mt-1">We've received your query and sent a confirmation to your email.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Your Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-[#1b6b3e]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-[#1b6b3e]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Order tracking issue, refund request, etc."
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-[#1b6b3e]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Detailed Message</label>
                <textarea 
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your issue here..."
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-[#1b6b3e] resize-none"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#1b6b3e] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#145230] transition-all flex items-center justify-center gap-2"
              >
                Send Message <ArrowRight size={14} />
              </button>
            </form>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
