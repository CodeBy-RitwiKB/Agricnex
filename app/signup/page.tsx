"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { Mail, Lock, User, Store, Phone, Loader2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { signUp, signOut } from "@/lib/auth-client";

const SignupContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role"); // 'merchant' or null (buyer)
  const isMerchant = role === "merchant";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    storeName: "",
    businessType: "Retailer",
  });

  const isSubmittingRef = React.useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    if (!isSubmittingRef.current) {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const hasLength = formData.password.length >= 8;
        const hasUpper = /[A-Z]/.test(formData.password);
        const hasLower = /[a-z]/.test(formData.password);
        const hasNumber = /[0-9]/.test(formData.password);
        const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);

        if (!(hasLength && hasUpper && hasLower && hasNumber && hasSpecial)) {
            setError("Password does not meet security strength requirements.");
            setIsLoading(false);
            return;
        }

        const { data, error } = await signUp.email({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=1b6b3e&color=fff`,
            phoneNumber: formData.phone,
            // @ts-ignore
            role: isMerchant ? "merchant" : "customer",
        }, {
            onSuccess: async (ctx) => {
                // If it's a merchant, we MUST await the profile creation to guarantee the database transaction completes
                if (isMerchant) {
                    try {
                        const response = await fetch("/api/merchants", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                userId: ctx.data.user.id,
                                storeName: formData.storeName,
                                businessType: formData.businessType
                            })
                        });
                        if (!response.ok) {
                            console.error("Failed to create merchant profile:", await response.text());
                        }
                    } catch (err) {
                        console.error("Failed to create merchant profile:", err);
                    }
                }

                // Explicitly sign out because Better Auth automatically logs in the user on signup,
                // which causes the proxy middleware to route them straight to the customer dashboard.
                try {
                    await signOut();
                    if (typeof document !== "undefined") {
                        document.cookie = "user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    }
                } catch (e) {}

                // 1. Mark as registered and trigger native form POST submit inside target iframe by clicking native button again
                isSubmittingRef.current = true;
                
                // Try programmatically saving credentials with Credential API if supported
                if (typeof window !== "undefined" && (window as any).PasswordCredential && navigator.credentials) {
                    try {
                        const cred = new (window as any).PasswordCredential({
                            id: formData.email,
                            password: formData.password,
                            name: formData.name
                        });
                        navigator.credentials.store(cred).catch(() => {});
                    } catch (e) {}
                }

                const submitBtn = document.getElementById("native_signup_btn");
                if (submitBtn) {
                    submitBtn.click();
                }

                // 2. Allow 400ms for the browser to register the native form POST submission before hard navigating
                setTimeout(() => {
                    window.location.href = "/login?signup=success";
                }, 400);
            },
            onError: (ctx) => {
                setError(ctx.error.message || "Registration failed. Please try again.");
                setIsLoading(false);
            }
        });
    } else {
        // Phase 2: This is the native HTML submit. We let the browser post the actual form to our hidden iframe.
        // This is the golden action that triggers Google Password Manager's native "Save Password" prompt.
    }
  };

  return (
    <AuthLayout 
      title={isMerchant ? "Start Selling" : "Create Account"} 
      subtitle={isMerchant 
        ? "Open your digital storefront and reach thousands of farmers." 
        : "Join Agrinex today for the best agricultural products."}
      type={isMerchant ? "merchant" : "user"}
      image={isMerchant 
        ? "https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=2068&auto=format&fit=crop" 
        : "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2070&auto=format&fit=crop"}
    >
      <form 
        id="signup_form"
        onSubmit={handleSubmit} 
        method="POST"
        action="/signup"
        target="signup_iframe"
        className="space-y-6"
      >
        {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <p className="text-xs font-bold text-red-500">{error}</p>
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-1">
                    Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1b6b3e] transition-colors" size={20} />
                    <input 
                        type="text" 
                        id="name"
                        name="name"
                        autoComplete="name"
                        required
                        placeholder="e.g. John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl py-4 pl-16 pr-6 font-bold text-sm focus:outline-none focus:border-[#1b6b3e] transition-all"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-1">
                    Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1b6b3e] transition-colors" size={20} />
                    <input 
                        type="tel" 
                        id="phone"
                        name="phone"
                        autoComplete="tel"
                        required
                        placeholder="e.g. +91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl py-4 pl-16 pr-6 font-bold text-sm focus:outline-none focus:border-[#1b6b3e] transition-all"
                    />
                </div>
            </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-1">
              Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1b6b3e] transition-colors" size={20} />
            <input 
              type="email" 
              id="email"
              name="email"
              autoComplete="email"
              required
              placeholder="e.g. name@company.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl py-4 pl-16 pr-6 font-bold text-sm focus:outline-none focus:border-[#1b6b3e] transition-all"
            />
          </div>
        </div>

        {isMerchant && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-1">
                        Store Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                        <Store className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1b6b3e] transition-colors" size={20} />
                        <input 
                            type="text" 
                            required={isMerchant}
                            placeholder="e.g. Green Valley Seeds"
                            value={formData.storeName}
                            onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                            className="w-full bg-[var(--card)] border-2 border-orange-500/30 rounded-2xl py-4 pl-16 pr-6 font-bold text-sm focus:outline-none focus:border-orange-500 transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Business Type</label>
                    <select 
                        value={formData.businessType}
                        onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                        className="w-full bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl py-4 px-6 font-black text-[10px] uppercase tracking-widest focus:outline-none focus:border-[#1b6b3e] transition-all appearance-none cursor-pointer"
                    >
                        <option value="Retailer">Retailer</option>
                        <option value="Wholesaler">Wholesaler</option>
                        <option value="Manufacturer">Manufacturer</option>
                        <option value="FPO">Farmer Producer Org</option>
                    </select>
                </div>
            </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-1">
              Secure Password <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1b6b3e] transition-colors" size={20} />
            <input 
              type="password" 
              id="password"
              name="password"
              autoComplete="new-password"
              required
              placeholder="e.g. P@ssword123"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl py-4 pl-16 pr-6 font-bold text-sm focus:outline-none focus:border-[#1b6b3e] transition-all"
            />
          </div>
          {formData.password && (
              <div className="mt-3 p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Security Strength</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-bold">
                      <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", formData.password.length >= 8 ? "bg-green-500 shadow-md shadow-green-500/30" : "bg-gray-300")} />
                          <span className={formData.password.length >= 8 ? "text-green-600 dark:text-green-400" : "text-gray-400"}>At least 8 characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", (/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password)) ? "bg-green-500 shadow-md shadow-green-500/30" : "bg-gray-300")} />
                          <span className={(/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password)) ? "text-green-600 dark:text-green-400" : "text-gray-400"}>Upper & lower case</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", /[0-9]/.test(formData.password) ? "bg-green-500 shadow-md shadow-green-500/30" : "bg-gray-300")} />
                          <span className={/[0-9]/.test(formData.password) ? "text-green-600 dark:text-green-400" : "text-gray-400"}>At least 1 number</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", /[^A-Za-z0-9]/.test(formData.password) ? "bg-green-500 shadow-md shadow-green-500/30" : "bg-gray-300")} />
                          <span className={/[^A-Za-z0-9]/.test(formData.password) ? "text-green-600 dark:text-green-400" : "text-gray-400"}>At least 1 symbol</span>
                      </div>
                  </div>
              </div>
          )}
        </div>

        <button 
          id="native_signup_btn"
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all flex items-center justify-center gap-3",
            isMerchant 
                ? "bg-[#ff9900] text-white shadow-orange-500/30" 
                : "bg-[#1b6b3e] text-white shadow-[#1b6b3e]/30 hover:scale-[1.02] active:scale-95"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Creating Account...
            </>
          ) : (
            <>
              {isMerchant ? "Launch My Store" : "Create My Account"} <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className="text-center pt-4">
            <p className="text-xs font-bold text-gray-400">
                Already have an account? <Link href="/login" className="text-[#1b6b3e] hover:underline">Login Now</Link>
            </p>
        </div>
      </form>

      {/* Hidden iframe targets for native POST redirection loops */}
      <iframe name="signup_iframe" id="signup_iframe" style={{ display: 'none' }}></iframe>
    </AuthLayout>
  );
};

const SignupPage = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <Loader2 className="animate-spin text-[#1b6b3e]" size={40} />
            </div>
        }>
            <SignupContent />
        </Suspense>
    );
};

export default SignupPage;
