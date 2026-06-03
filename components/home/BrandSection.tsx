"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const brands = [
  { name: "John Deere", logo: "🚜", offer: "Min. 10% Off" },
  { name: "Monsanto", logo: "🧬", offer: "Up to 20% Off" },
  { name: "Netafim", logo: "💧", offer: "Flat ₹500 Off" },
  { name: "Bayer", logo: "🛡️", offer: "Buy 1 Get 1" },
  { name: "Syngenta", logo: "🌾", offer: "Top Deals" },
  { name: "Mahindra", logo: "🚜", offer: "New Launch" },
];

const BrandSection = () => {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-agri-brown">Featured Brands</h2>
          <Link href="#" className="flex items-center gap-1 text-agri-green font-bold text-sm hover:underline">
            VIEW ALL <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="group cursor-pointer flex flex-col items-center gap-4 p-6 rounded-xl border border-gray-50 hover:border-agri-green/20 hover:shadow-lg transition-all bg-gray-50/30"
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                {brand.logo}
              </div>
              <div className="text-center">
                <h3 className="font-bold text-agri-brown text-sm">{brand.name}</h3>
                <p className="text-agri-green text-[10px] font-bold uppercase tracking-wider mt-1">
                  {brand.offer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandSection;
