"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard, { Product } from "@/components/product/ProductCard";
import { Filter, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";
  
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [category, setCategory] = React.useState(initialCategory);
  const [search, setSearch] = React.useState(initialSearch);
  const [sortBy, setSortBy] = React.useState("created_at_desc");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pagination, setPagination] = React.useState({
    total: 0,
    totalPages: 0,
    limit: 20
  });

  // Sync state with URL
  React.useEffect(() => {
    setCategory(searchParams.get("category") || "");
    setSearch(searchParams.get("search") || "");
    setCurrentPage(1); // Reset page when filters change from URL
  }, [searchParams]);

  // Reset page when sorting changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  const categoryMapping: Record<string, string> = {
    'VEGETABLE': 'Vegetable & Fruit Seeds',
    'FLOWER': 'Flower Seeds',
    'SEEDS': 'Vegetable & Fruit Seeds',
    'CROP PROTECTION': 'Insecticides',
    'CROP NUTRITION': 'Nutrients',
    'EQUIPMENTS': 'Farm Machinery',
    'ANIMAL HUSBANDRY': 'Animal Husbandry',
    'ORGANIC': 'Organic'
  };

  React.useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const parts = sortBy.split('_');
        const order = parts.pop();
        const field = parts.join('_');
        
        // Map the category from the URL to the DB name if needed
        const dbCategory = categoryMapping[category.toUpperCase()] || category;
        
        const url = `/api/products?page=${currentPage}&limit=20&category=${encodeURIComponent(dbCategory)}&search=${encodeURIComponent(search)}&sort=${field}&order=${order || 'desc'}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.success) {
          setProducts(data.data);
          if (data.pagination) {
            setPagination(data.pagination);
          }
        }
        
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [category, search, sortBy, currentPage]);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8">
        <Link href="/" className="hover:text-[#1b6b3e] transition-colors">Home</Link>
        <ChevronRight size={12} />
        <span className="text-[#1b6b3e]">Products</span>
        {(category || search) && (
            <>
                <ChevronRight size={12} />
                <span className="text-[#1b6b3e]">{category || search}</span>
            </>
        )}
      </div>

      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--foreground)] mb-2 uppercase tracking-tighter">
            {search ? search : (category || "All Products")}
          </h1>
          <p className="text-gray-500 font-bold text-lg">Discover premium agricultural essentials.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl pl-10 pr-10 py-4 font-black text-sm outline-none focus:border-[#1b6b3e] transition-all appearance-none cursor-pointer shadow-sm hover:shadow-md"
            >
              <option value="created_at_desc">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {isLoading ? (
          Array(10).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4"></div>
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/3"></div>
            </div>
          ))
        ) : products.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="col-span-full py-32 text-center bg-[var(--card)] rounded-[40px] border border-[var(--border)] border-dashed">
            <div className="text-9xl mb-8 animate-bounce">🌱</div>
            <h3 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tighter">No products found</h3>
            <p className="text-gray-500 font-bold mt-4 text-lg max-w-md mx-auto">We couldn't find any items matching your selection. Try exploring a different category!</p>
            <button 
              onClick={() => {
                  setCategory("");
                  setSearch("");
              }}
              className="mt-10 bg-[#1b6b3e] text-white px-10 py-4 rounded-2xl font-black text-lg hover:scale-110 transition-all shadow-xl shadow-[#1b6b3e]/20"
            >
              Browse All Products
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && products.length > 0 && pagination.totalPages > 1 && (
        <div className="mt-20 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[var(--card)] border border-[var(--border)] text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#1b6b3e] hover:text-[#1b6b3e] transition-all"
            >
              <ChevronsLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[var(--card)] border border-[var(--border)] text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#1b6b3e] hover:text-[#1b6b3e] transition-all"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-2 mx-4">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "w-12 h-12 flex items-center justify-center rounded-2xl font-black text-sm transition-all",
                      currentPage === pageNum
                        ? "bg-[#1b6b3e] text-white shadow-lg shadow-[#1b6b3e]/20 scale-110"
                        : "bg-[var(--card)] border border-[var(--border)] text-gray-500 hover:border-[#1b6b3e] hover:text-[#1b6b3e]"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={currentPage === pagination.totalPages}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[var(--card)] border border-[var(--border)] text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#1b6b3e] hover:text-[#1b6b3e] transition-all"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setCurrentPage(pagination.totalPages)}
              disabled={currentPage === pagination.totalPages}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[var(--card)] border border-[var(--border)] text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#1b6b3e] hover:text-[#1b6b3e] transition-all"
            >
              <ChevronsRight size={20} />
            </button>
          </div>
          
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Showing Page <span className="text-[#1b6b3e]">{currentPage}</span> of <span className="text-[#1b6b3e]">{pagination.totalPages}</span> — <span className="text-gray-500">{pagination.total} Total Products</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[var(--background)] transition-colors duration-500">
      <Header />
      <Suspense fallback={
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-[#1b6b3e] border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-[#1b6b3e] uppercase tracking-widest text-xs">Syncing Catalog...</p>
        </div>
      }>
        <ProductsContent />
      </Suspense>
      <Footer />
    </main>
  );
}
