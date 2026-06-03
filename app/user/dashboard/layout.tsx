"use client";
import React from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Footer from "@/components/layout/Footer";
import UserSidebar from "@/components/layout/UserSidebar";

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            <DashboardHeader type="user" />
            
            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 sticky top-32 h-fit">
                        <UserSidebar />
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        {children}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
