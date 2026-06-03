"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { ShieldCheck, Lock, Mail, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { signIn } from "@/lib/auth-client";

const AdminLoginPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    securityKey: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Verify the dynamic 2FA code with the server first
      const verifyRes = await fetch("/api/admin/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          securityKey: formData.securityKey
        })
      });

      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        setError(verifyData.error || "Invalid Security Key: 2FA clearance failed.");
        setIsLoading(false);
        return;
      }

      // 2. 2FA is verified! Proceed with email/password authentication
      const { data, error } = await signIn.email({
          email: formData.email,
          password: formData.password,
      }, {
          onSuccess: (ctx) => {
              const user = ctx.data.user;
              if (user.role === "admin") {
                  router.push("/admin/dashboard");
              } else {
                  setError("Unauthorized: Admin access required.");
                  setIsLoading(false);
              }
          },
          onError: (ctx) => {
              setError(ctx.error.message || "Invalid credentials");
              setIsLoading(false);
          }
      });
    } catch (err) {
      setError("An unexpected error occurred during login.");
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Admin Terminal" 
      subtitle="Authorized access only. All sessions are monitored and logged."
      type="admin"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <p className="text-xs font-bold text-red-500">{error}</p>
            </div>
        )}
        <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-8">
            <ShieldCheck className="text-red-500" size={24} />
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Security Protocol</span>
                <span className="text-[9px] font-bold text-gray-400">Restricted Area: Level 1 Clearance Required</span>
            </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Admin Email</label>
          <div className="relative group">
            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
            <input 
              type="email" 
              required
              placeholder="admin@agrinex.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-2xl py-4 pl-16 pr-6 font-bold text-sm text-white focus:outline-none focus:border-red-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Access Password</label>
          <div className="relative group">
            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-2xl py-4 pl-16 pr-6 font-bold text-sm text-white focus:outline-none focus:border-red-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Security Key (2FA)</label>
          <input 
            type="text" 
            required
            placeholder="000-000"
            value={formData.securityKey}
            onChange={(e) => setFormData({...formData, securityKey: e.target.value})}
            className="w-full bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-2xl py-4 px-6 font-mono text-center tracking-[0.5em] text-lg text-white focus:outline-none focus:border-red-500 transition-all"
          />
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-red-900/40 hover:bg-red-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-8"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Verifying Credentials...
            </>
          ) : (
            <>
              Access Admin Terminal <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className="text-center pt-4">
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-relaxed">
                Emergency lockout will trigger after 3 failed attempts.<br />
                System log: 192.168.1.1 // Secure Node 04
            </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default AdminLoginPage;
