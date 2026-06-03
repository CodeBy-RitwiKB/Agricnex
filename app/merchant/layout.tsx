"use client";
import React, { useEffect } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Footer from "@/components/layout/Footer";
import MerchantSidebar from "@/components/layout/MerchantSidebar";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2, ShieldAlert } from "lucide-react";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, isPending } = useSession();

    useEffect(() => {
        if (!isPending) {
            if (!session) {
                // Not logged in -> redirect to login with original path as redirect callback
                router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
            } else if (session.user?.role !== "merchant" && session.user?.role !== "admin") {
                // Non-merchant role -> redirect to homepage
                router.replace("/");
            }
        }
    }, [session, isPending, router, pathname]);

    // Premium skeleton/spinner loading view while checking auth credentials
    if (isPending) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-[#ff9900]" size={48} />
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Verifying merchant credentials...</p>
            </div>
        );
    }

    // Access Denied safety state for unauthorized users
    if (!session || (session.user?.role !== "merchant" && session.user?.role !== "admin")) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-4">
                <ShieldAlert className="text-red-500 animate-bounce" size={48} />
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Access Denied. Redirecting...</p>
            </div>
        );
    }

    // Check if the current route is the new product screen to render standalone
    if (pathname === "/merchant/inventory/new") {
        return (
            <div className="min-h-screen bg-[var(--background)]">
                <DashboardHeader type="merchant" />
                <main className="w-full">
                    {children}
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <DashboardHeader type="merchant" />
            
            <main className="max-w-[1400px] mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar */}
                    <div className="w-full lg:w-72 shrink-0 sticky top-32 h-fit">
                        <MerchantSidebar />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {children}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
