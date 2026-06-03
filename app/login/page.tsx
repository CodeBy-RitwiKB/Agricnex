"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { signIn, signOut } from "@/lib/auth-client";

const triggerPasswordSave = (email: string, pass: string) => {
  if (typeof document === "undefined") return;
  try {
    // 1. Create hidden iframe if it doesn't exist
    let iframe = document.getElementById("password_save_iframe") as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "password_save_iframe";
      iframe.name = "password_save_iframe";
      iframe.style.display = "none";
      document.body.appendChild(iframe);
    }

    // 2. Create hidden form that mimics traditional submission
    const form = document.createElement("form");
    form.action = "about:blank";
    form.method = "POST";
    form.target = "password_save_iframe";
    form.style.display = "none";

    const usernameInput = document.createElement("input");
    usernameInput.type = "text";
    usernameInput.name = "username";
    usernameInput.value = email;
    form.appendChild(usernameInput);

    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.name = "password";
    passwordInput.value = pass;
    form.appendChild(passwordInput);

    document.body.appendChild(form);
    form.submit();

    // Clean up dynamically created form shortly after submission
    setTimeout(() => {
      form.remove();
    }, 500);
  } catch (e) {
    console.warn("Trigger password save failed:", e);
  }
};

const LoginPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  if (typeof window !== "undefined") {
    const qRed = new URLSearchParams(window.location.search).get("redirect");
    console.log("LoginPage: Initial render. localStorage:", localStorage.getItem("auth-redirect"), "queryRedirect:", qRed);
  }

  const isSubmittingRef = React.useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    if (!isSubmittingRef.current) {
      e.preventDefault();
      setIsLoading(true);
      setError("");

      const { data, error } = await signIn.email({
        email: formData.email,
        password: formData.password,
      }, {
        onSuccess: async (ctx) => {
          const user = ctx.data.user;

          if (user?.role === "admin") {
            await signOut();
            router.push("/admin/login");
            setIsLoading(false);
            return;
          }

          // 1. Mark as authenticated and programmatically click submit again
          isSubmittingRef.current = true;

          // Try programmatically saving credentials with Credential API if supported
          if (typeof window !== "undefined" && (window as any).PasswordCredential && navigator.credentials) {
            try {
              const cred = new (window as any).PasswordCredential({
                id: formData.email,
                password: formData.password
              });
              navigator.credentials.store(cred).catch(() => { });
            } catch (err) { }
          }

          const submitBtn = document.getElementById("native_submit_btn");
          if (submitBtn) {
            submitBtn.click();
          }

          const queryRedirect = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") : null;
          const savedRedirect = (typeof window !== "undefined" ? localStorage.getItem("auth-redirect") : null) || queryRedirect;
          console.log("LoginPage onSuccess: savedRedirect is:", savedRedirect);

          // 2. Allow 400ms for the browser to register the native form POST submission before hard navigating
          setTimeout(() => {
            console.log("LoginPage setTimeout firing. savedRedirect:", savedRedirect, "user role:", user?.role);
            router.refresh(); // Invalidate cache so session is fully recognized
            
            // Set user-role cookie for the proxy middleware
            if (typeof document !== "undefined") {
              document.cookie = `user-role=${user?.role || "customer"}; path=/; max-age=31536000; SameSite=Lax`;
            }

            if (savedRedirect) {
              console.log("LoginPage redirecting to:", savedRedirect);
              if (typeof window !== "undefined") {
                localStorage.removeItem("auth-redirect");
              }
              router.replace(savedRedirect);
            } else if (user?.role === "merchant") {
              router.replace("/merchant");
            } else if (user?.role === "admin") {
              router.replace("/admin/dashboard");
            } else {
              router.replace("/user/dashboard");
            }
          }, 400);
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Invalid email or password");
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
      title="Welcome Back"
      subtitle="Log in to manage your orders or shop your favorite products."
    >
      <form
        id="login_form"
        onSubmit={handleSubmit}
        method="POST"
        action="/login"
        target="login_iframe"
        className="space-y-6"
      >
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="text-red-500 shrink-0" size={18} />
            <p className="text-xs font-bold text-red-500">{error}</p>
          </div>
        )}
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
              autoComplete="username email"
              required
              placeholder="e.g. john@agrinex.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl py-4 pl-16 pr-6 font-bold text-sm focus:outline-none focus:border-[#1b6b3e] transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
              Password <span className="text-red-500">*</span>
            </label>
            <Link href="#" className="text-[9px] font-black text-[#1b6b3e] uppercase tracking-widest hover:underline">Forgot?</Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1b6b3e] transition-colors" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              autoComplete="current-password"
              required
              placeholder="Enter your secure password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl py-4 pl-16 pr-14 font-bold text-sm focus:outline-none focus:border-[#1b6b3e] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1b6b3e] transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          id="native_submit_btn"
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1b6b3e] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-[#1b6b3e]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Authenticating...
            </>
          ) : (
            <>
              Login to Account <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className="text-center pt-4">
          <p className="text-xs font-bold text-gray-400">
            Don't have an account? <Link href="/signup" className="text-[#1b6b3e] hover:underline">Create Account</Link>
          </p>
        </div>
      </form>

      {/* Hidden iframe targets for native POST redirection loops */}
      <iframe name="login_iframe" id="login_iframe" style={{ display: 'none' }}></iframe>
    </AuthLayout>
  );
};

export default LoginPage;
