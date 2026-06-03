"use client";
import React from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
            <DashboardHeader type="admin" />
            
            <div className="flex">
                <AdminSidebar />
                <main className="flex-1 p-8 lg:p-12">
                    {children}
                </main>
            </div>
        </div>
    );
}
