"use client";

import React from "react";
import { Star, ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import ProductCard, { Product as TrendingProduct } from "@/components/product/ProductCard";

const TrendingCard = ({ product }: { product: TrendingProduct }) => {
    return <ProductCard product={product} />;
};

const TrendingGrid = ({ products = [] }: { products?: TrendingProduct[] }) => {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-[var(--foreground)] flex items-center gap-2">
          Trending Products 🔥
        </h2>
        <p className="text-gray-500 font-bold mt-1">Farmer favorites this week.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {products.map((product) => (
          <TrendingCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link 
            href="/products"
            className="w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] text-[#1b6b3e] py-4 rounded-xl font-black text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm text-center"
        >
          View All Trending Deals
        </Link>
      </div>
    </section>
  );
};

export default TrendingGrid;
