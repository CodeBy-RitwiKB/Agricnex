"use client";

import React from "react";
import { ChevronRight, Star, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import ProductCard, { Product } from "@/components/product/ProductCard";

interface ProductSectionProps {
  title: string;
  products: Product[];
  isLoading?: boolean;
  categoryName?: string;
}

const ProductSection = ({ title, products, isLoading, categoryName }: ProductSectionProps) => {
  const targetCategory = categoryName || (title === "Today's Offer" ? "Offers" : title.split(' ').pop());

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="bg-[var(--card)] rounded-2xl shadow-sm border border-[var(--border)] p-6 md:p-8 transition-colors duration-500">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-agri-green rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)]">{title}</h2>
          </div>
          <Link href={`/products?category=${targetCategory}`} className="flex items-center gap-1 text-agri-green font-black text-xs hover:underline uppercase tracking-widest">
            View All Deals <ChevronRight size={16} />
          </Link>
        </div>

        <div className="flex items-stretch overflow-x-auto no-scrollbar gap-6 md:gap-8 pb-4">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
                <div key={i} className="min-w-[220px] md:min-w-[260px] animate-pulse">
                    <div className="h-44 md:h-52 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/3"></div>
                </div>
            ))
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
