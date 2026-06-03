"use client";

import React, { useState, useEffect } from "react";
import { Star, ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/lib/auth-client";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image_url: string;
  categories?: {
    name: string;
  };
}

let staticWishlistCache: any = null;

const ProductCard = ({ product }: { product: Product }) => {
  const originalPrice = product.originalPrice || Math.round(product.price * 1.25);
  const discount = originalPrice > product.price ? Math.round(((originalPrice - product.price) / originalPrice) * 100) : 0;
  const categoryName = product.categories?.name || "Agriculture";
  const { addItem } = useCart();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Global in-memory cache to merge parallel wishlist fetches for the same user
  // Declared at component-file level to share across all ProductCard instances
  staticWishlistCache = staticWishlistCache || {
    userId: "",
    items: [],
    timestamp: 0,
    promise: null
  };

  useEffect(() => {
    if (!userId) return;
    
    const getWishlistItems = async () => {
      const now = Date.now();
      
      // If we have cached items from the last 3 seconds, return them
      if (staticWishlistCache.userId === userId && (now - staticWishlistCache.timestamp) < 3000) {
        return staticWishlistCache.items;
      }
      
      // If a request is already in-flight, return the shared promise
      if (staticWishlistCache.userId === userId && staticWishlistCache.promise) {
        return staticWishlistCache.promise;
      }
      
      // Initiate a single shared fetch request
      const fetchPromise = (async () => {
        try {
          const res = await fetch(`/api/user/wishlist?userId=${userId}`);
          const data = await res.json();
          if (data.success && data.items) {
            staticWishlistCache.items = data.items;
            staticWishlistCache.timestamp = Date.now();
            staticWishlistCache.promise = null; // Clear promise once resolved
            return data.items;
          }
          return [];
        } catch (err) {
          console.error("Error fetching wishlist in product card cache:", err);
          return [];
        }
      })();
      
      staticWishlistCache.userId = userId;
      staticWishlistCache.promise = fetchPromise;
      
      return fetchPromise;
    };

    const checkWishlist = async () => {
      const items = await getWishlistItems();
      if (items) {
        const found = items.some((item: any) => item.product_id === product.id);
        setIsWishlisted(found);
      }
    };
    
    checkWishlist();
  }, [userId, product.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
      alert("Please log in to add products to your wishlist");
      return;
    }

    try {
      if (isWishlisted) {
        const res = await fetch(`/api/user/wishlist?userId=${userId}&productId=${product.id}`, {
          method: "DELETE"
        });
        const data = await res.json();
        if (data.success) {
          setIsWishlisted(false);
        }
      } else {
        const res = await fetch("/api/user/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, productId: product.id })
        });
        const data = await res.json();
        if (data.success) {
          setIsWishlisted(true);
        }
      }
    } catch (err) {
      console.error("Failed to toggle wishlist status:", err);
    }
  };

  return (
    <Link href={`/product/${product.id}`} className="min-w-[220px] md:min-w-[260px] bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:shadow-2xl transition-all group cursor-pointer flex flex-col h-full">
      <div className="relative h-44 md:h-52 bg-[var(--background)] rounded-lg mb-4 flex items-center justify-center text-7xl group-hover:scale-105 transition-transform overflow-hidden border border-[var(--border)]">
        {product.image_url ? (
            <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" 
            />
        ) : (
            <span className="opacity-20 text-4xl">🌱</span>
        )}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-[#1b6b3e] text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm">
            {discount}% OFF
          </div>
        )}
        <button 
          onClick={handleToggleWishlist}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full shadow-md transition-all bg-white/95 dark:bg-gray-800 border border-[var(--border)] z-20 hover:scale-110",
            isWishlisted ? "text-red-500" : "text-gray-400 hover:text-red-500"
          )}
        >
            <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        <button 
          onClick={handleAddToCart}
          className={cn(
            "absolute bottom-3 right-3 p-2.5 rounded-full shadow-lg transition-all translate-y-4 group-hover:translate-y-0",
            isAdded ? "bg-[#1b6b3e] text-white opacity-100 translate-y-0" : "bg-[var(--card)] text-[#1b6b3e] opacity-0 group-hover:opacity-100 hover:bg-[#1b6b3e] hover:text-white"
          )}
        >
            <ShoppingCart size={18} />
        </button>
      </div>
      
      <div className="space-y-2 flex-1 flex flex-col">
        <p className="text-[10px] text-[#1b6b3e] font-black uppercase tracking-widest">{categoryName}</p>
        <h3 className="font-bold text-[var(--foreground)] text-sm md:text-base line-clamp-2 leading-snug group-hover:text-[#1b6b3e] transition-colors h-10 md:h-12 flex items-start overflow-hidden">{product.name}</h3>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 bg-yellow-400 text-gray-900 text-[10px] px-1.5 py-0.5 rounded-full font-black">
            {(product.rating ?? 4.5).toFixed(1)} <Star size={10} fill="currentColor" />
          </div>
          <span className="text-[10px] text-gray-400 font-bold">({product.reviews ?? 10} reviews)</span>
        </div>

        <div className="mt-auto pt-3 border-t border-[var(--border)]">
            <div className="flex items-baseline gap-2">
            <span className="font-black text-xl text-[var(--foreground)]">₹{product.price.toLocaleString()}</span>
            {originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
            )}
            </div>
            {originalPrice > product.price && (
              <p className="text-[10px] text-red-500 font-bold mt-1">Extra ₹{Math.round(originalPrice - product.price).toLocaleString()} Savings</p>
            )}
        </div>
        
        <button 
          onClick={handleAddToCart}
          className={cn(
            "w-full py-2.5 rounded-lg font-bold text-sm mt-4 transition-all shadow-sm",
            isAdded ? "bg-black text-white" : "bg-[#1b6b3e] text-white hover:bg-[#1b6b3e]/90"
          )}
        >
            {isAdded ? "Added to Cart!" : "Add To Cart"}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
