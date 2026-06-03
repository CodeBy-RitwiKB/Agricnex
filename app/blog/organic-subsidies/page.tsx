"use client";

import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ChevronRight, Calendar, User, ArrowLeft, Landmark, Coins, HelpCircle, CheckCircle2 } from "lucide-react";

export default function OrganicSubsidiesBlog() {
  return (
    <main className="min-h-screen bg-[var(--background)] transition-colors duration-500">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-[var(--card)] border-b border-[var(--border)] py-4 transition-colors duration-500">
        <div className="container mx-auto px-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
          <Link href="/" className="hover:text-[#1b6b3e] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#1b6b3e]">Blog</span>
          <ChevronRight size={12} />
          <span className="text-[var(--foreground)] truncate">Organic Farming Subsidies</span>
        </div>
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-4 py-16 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#1b6b3e] hover:underline mb-8"
        >
          <ArrowLeft size={14} /> Back to Homepage
        </Link>

        {/* Category & Title */}
        <div className="space-y-4 mb-8">
          <span className="inline-block bg-orange-100 dark:bg-orange-950/30 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Schemes
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--foreground)] leading-tight">
            Organic Farming in India: Key Government Subsidies & Schemes
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-gray-400 border-y border-[var(--border)] py-4">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#1b6b3e]" />
              <span>Published on May 08, 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={14} className="text-[#1b6b3e]" />
              <span>By Agrinex Policy Advisory</span>
            </div>
          </div>
        </div>

        {/* Feature Image */}
        <div className="w-full h-96 rounded-[40px] overflow-hidden mb-12 shadow-xl border border-[var(--border)]">
          <img 
            src="/organic_farming.png" 
            alt="Organic farming fields" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Body Text */}
        <div className="space-y-8 text-base text-[var(--foreground)]/80 leading-relaxed font-medium">
          <p className="text-lg font-bold text-[var(--foreground)]">
            As health awareness increases globally and the adverse ecological effects of chemical farming become clear, the Government of India has taken aggressive measures to promote sustainable agriculture. Through specialized subsidies and schemes, farmers can receive significant financial backing to adopt organic farming inputs and gain organic certifications.
          </p>

          <h3 className="text-2xl font-black text-[var(--foreground)] pt-4 border-b border-[var(--border)] pb-2 flex items-center gap-2">
            <Landmark className="text-[#1b6b3e]" /> 1. Paramparagat Krishi Vikas Yojana (PKVY)
          </h3>
          <p>
            Launched in 2015, PKVY is the flagship scheme implemented on a cluster basis to promote chemical-free organic farming across the country.
          </p>
          <ul className="space-y-3 list-inside list-disc pl-2">
            <li><strong>Financial Assistance:</strong> Under the scheme, financial assistance of ₹50,000 per hectare for 3 years is provided.</li>
            <li><strong>DBT Input Subsidy:</strong> Out of this, ₹31,000 (62%) is directly credited to the farmer via Direct Benefit Transfer (DBT) for purchasing organic inputs (seeds, bio-fertilizers, bio-pesticides, vermicompost, etc.).</li>
            <li><strong>Cluster Formation:</strong> Participatory groups of 20 or more farmers are encouraged to facilitate collective certification and marketing.</li>
          </ul>

          <h3 className="text-2xl font-black text-[var(--foreground)] pt-4 border-b border-[var(--border)] pb-2 flex items-center gap-2">
            <Coins className="text-[#1b6b3e]" /> 2. MOVCDNER (For Northeastern Region)
          </h3>
          <p>
            The Mission Organic Value Chain Development for Northeastern Region (MOVCDNER) is a dedicated central scheme targeting NE states (Assam, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura, and Arunachal Pradesh).
          </p>
          <ul className="space-y-3 list-inside list-disc pl-2">
            <li><strong>Acreage Support:</strong> Assistance of ₹25,000 per hectare for 3 years is provided for organic inputs, seeds, and planting materials.</li>
            <li><strong>Infrastructure Assistance:</strong> Financial support of up to ₹10 Lakhs is provided to Farmer Producer Organizations (FPOs) for setting up custom hiring centers, collection units, and packaging facilities.</li>
          </ul>

          <h3 className="text-2xl font-black text-[var(--foreground)] pt-4 border-b border-[var(--border)] pb-2 flex items-center gap-2">
            <CheckCircle2 className="text-[#1b6b3e]" /> 3. Organic Certification & Participatory Guarantee System (PGS)
          </h3>
          <p>
            Selling organic produce at premium rates requires formal certification. The government supports two main pathways:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)] space-y-3">
              <h4 className="font-black text-[#1b6b3e] uppercase tracking-wider text-xs">PGS-India Certification</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                A decentralized, low-cost domestic certification method managed by Ministry of Agriculture. Ideal for small-scale local farmers selling within domestic boundaries. Fully subsidized under PKVY clusters.
              </p>
            </div>

            <div className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)] space-y-3">
              <h4 className="font-black text-orange-500 uppercase tracking-wider text-xs">NPOP Certification (APEDA)</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                A structured export-oriented certification recognized internationally in regions like the US, EU, and Switzerland. Perfect for FPOs aiming to export organic spices, tea, and grains.
              </p>
            </div>
          </div>

          <h3 className="text-2xl font-black text-[var(--foreground)] pt-4 border-b border-[var(--border)] pb-2 flex items-center gap-2">
            <HelpCircle className="text-orange-500" /> How Can Farmers Enroll?
          </h3>
          <ol className="space-y-3 list-inside list-decimal pl-2">
            <li><strong>Create/Join a Cluster:</strong> Contact the local District Agriculture Officer (DAO) to join or initiate a PKVY cluster (minimum 20 hectares).</li>
            <li><strong>Register Online:</strong> Visit the government's official Jaivik Kheti Portal (https://jaivikkheti.in) to create a profile as an organic farmer or vendor.</li>
            <li><strong>Receive Training:</strong> Benefit from free crop management and biological input production training organized under national projects.</li>
          </ol>
        </div>
      </article>

      <Footer />
    </main>
  );
}
