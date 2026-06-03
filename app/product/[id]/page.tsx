"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { 
  Star, Heart, Share2, MapPin, Truck, ShieldCheck, 
  ChevronRight, ShoppingCart, Zap, PhoneCall, 
  Info, CheckCircle2, MessageSquare, AlertCircle,
  ArrowRight, Minus, Plus, Loader2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const ProductPage = () => {
  const params = useParams();
  const id = params.id as string;
  
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
   const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  
  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    async function fetchProduct() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        
        if (data.success) {
          setProduct(data.data);
          
          if (typeof window !== "undefined") {
            sessionStorage.setItem("agrinex_last_viewed_product_id", id);
          }
          
          // Fetch hybrid recommendations (Collaborative & Content-Based ML)
          try {
            const mlRes = await fetch(`/api/ai/ml?type=recommend&product_id=${id}&top_n=5`);
            const mlData = await mlRes.json();
            if (mlData.success && mlData.data?.recommended) {
              setRelatedProducts(mlData.data.recommended);
            } else {
              // Fallback to category list if ML service output is empty
              const fallbackRes = await fetch(`/api/products?category=${encodeURIComponent(data.data.categories?.name)}&limit=5`);
              const fallbackData = await fallbackRes.json();
              setRelatedProducts(fallbackData.products?.filter((p: any) => p.id !== id) || []);
            }
          } catch (mlErr) {
            // Fallback to category list
            const fallbackRes = await fetch(`/api/products?category=${encodeURIComponent(data.data.categories?.name)}&limit=5`);
            const fallbackData = await fallbackRes.json();
            setRelatedProducts(fallbackData.products?.filter((p: any) => p.id !== id) || []);
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="bg-[var(--background)] min-h-screen flex flex-col transition-colors duration-500">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-[#1b6b3e]" size={48} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Syncing Catalog...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-[var(--background)] min-h-screen transition-colors duration-500">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
            <AlertCircle size={64} className="mx-auto mb-6 text-red-500" />
            <h1 className="text-3xl font-black text-[var(--foreground)] mb-4">Product Not Found</h1>
            <Link href="/" className="bg-[#1b6b3e] text-white px-8 py-3 rounded-2xl font-black">Back to Shopping</Link>
        </div>
        <Footer />
      </div>
    );
  }

   const handleAddToCart = () => {
    addItem(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, quantity, true);
    router.push("/cart");
  };

  // Handle images - product.image_url is a string, we might want to make it an array for UI consistency
  const productImages = [product.image_url]; 

  return (
    <div className="bg-[var(--background)] min-h-screen transition-colors duration-500">
      <Header />

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <Link href="/" className="hover:text-[#1b6b3e] transition-colors">Home</Link> <ChevronRight size={10} />
            <Link href={`/products?category=${encodeURIComponent(product.categories?.name)}`} className="hover:text-[#1b6b3e] transition-colors">{product.categories?.name}</Link> <ChevronRight size={10} />
            <span className="text-[#1b6b3e] truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <main className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Image Gallery */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative aspect-square bg-[var(--card)] rounded-[40px] border border-[var(--border)] shadow-2xl flex items-center justify-center overflow-hidden group transition-all duration-500">
                <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
                    <button className="w-10 h-10 rounded-full bg-[var(--background)] shadow-lg flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"><Heart size={20} /></button>
                    <button className="w-10 h-10 rounded-full bg-[var(--background)] shadow-lg flex items-center justify-center text-gray-400 hover:text-[#1b6b3e] transition-all"><Share2 size={20} /></button>
                </div>
                <img 
                    src={productImages[selectedImage]} 
                    alt={product.name} 
                    className="w-full h-full object-contain p-12 group-hover:scale-110 transition-transform duration-700" 
                />
            </div>
            {productImages.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                    {productImages.map((img, i) => (
                        <button 
                            key={i}
                            onClick={() => setSelectedImage(i)}
                            className={cn(
                                "aspect-square rounded-2xl border-2 transition-all flex items-center justify-center bg-[var(--card)] shadow-sm p-2",
                                selectedImage === i ? "border-[#1b6b3e] scale-105 shadow-lg" : "border-[var(--border)] hover:border-gray-300"
                            )}
                        >
                            <img src={img} alt="" className="w-full h-full object-contain" />
                        </button>
                    ))}
                </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
                <p className="text-xs font-black text-[#1b6b3e] dark:text-[#28a745] uppercase tracking-[0.4em] mb-1">{product.name.split(' ')[0]}</p>
                <h1 className="text-4xl md:text-5xl font-black text-[var(--foreground)] leading-tight tracking-tighter">{product.name}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="flex items-center gap-1 bg-yellow-400 text-gray-900 px-4 py-1.5 rounded-full font-black text-xs shadow-lg shadow-yellow-400/20">
                        {product.rating.toFixed(1)} <Star size={14} fill="currentColor" />
                    </div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{product.reviews} Reviews</span>
                    {product.merchants && (
                        <>
                            <span className="text-gray-300">|</span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                Sold by: <span className="text-[#1b6b3e] dark:text-[#28a745] font-black">{product.merchants.store_name}</span>
                            </span>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-[var(--card)] p-8 md:p-10 rounded-[48px] border border-[var(--border)] shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#1b6b3e]/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:scale-150"></div>
                <div className="flex items-baseline gap-4 mb-4">
                    <span className="text-6xl font-black text-[var(--foreground)] tracking-tighter">₹{product.price}</span>
                    <span className="text-2xl text-gray-400 line-through decoration-red-500/50">₹{product.originalPrice.toFixed(0)}</span>
                    <span className="bg-[#ff9900] text-white px-4 py-1.5 rounded-2xl text-[10px] font-black shadow-lg shadow-orange-500/20 uppercase tracking-widest">20% OFF</span>
                </div>
                <div className="text-[#1b6b3e] dark:text-[#28a745] font-black text-sm mb-8 flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <Zap size={18} fill="currentColor" /> IN STOCK & READY TO SHIP
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="flex items-center bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl p-1.5 shadow-inner w-full sm:w-auto justify-between min-w-[140px]">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-[#1b6b3e]/10 hover:text-[#1b6b3e] rounded-xl transition-all"><Minus size={20} /></button>
                            <span className="w-12 text-center font-black text-xl text-[var(--foreground)]">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-[#1b6b3e]/10 hover:text-[#1b6b3e] rounded-xl transition-all"><Plus size={20} /></button>
                        </div>
                         <div className="flex items-center gap-4 w-full">
                            <button 
                                onClick={handleAddToCart}
                                className={cn(
                                    "flex-1 py-5 rounded-[28px] font-black uppercase tracking-widest text-[10px] md:text-xs shadow-2xl transition-all flex items-center justify-center gap-3",
                                    isAdded ? "bg-black text-white shadow-black/40" : "bg-[#1b6b3e] text-white shadow-[#1b6b3e]/40 hover:scale-[1.03] active:scale-95"
                                )}
                            >
                                {isAdded ? (
                                    <>
                                        <CheckCircle2 size={20} /> Added to Cart
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={20} /> Add To Cart
                                    </>
                                )}
                            </button>
                            <button 
                                onClick={handleBuyNow}
                                className="flex-1 bg-[#ff9900] text-white py-5 rounded-[28px] font-black uppercase tracking-widest text-[10px] md:text-xs shadow-2xl shadow-[#ff9900]/40 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <Zap size={20} fill="currentColor" /> Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>

          </div>
        </div>

        {/* Technical Specs & Description */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-20">
                <div className="space-y-8">
                    <h3 className="text-3xl font-black text-[var(--foreground)] flex items-center gap-4">
                        <div className="w-2 h-8 bg-[#1b6b3e] rounded-full shadow-lg shadow-[#1b6b3e]/30"></div>
                        Overview
                    </h3>
                    <div className="overflow-hidden rounded-[40px] border border-[var(--border)] shadow-xl bg-[var(--card)]">
                        <div className="grid grid-cols-2 p-6 border-b border-[var(--border)] group hover:bg-[var(--background)] transition-colors">
                            <span className="text-gray-400 uppercase text-[10px] font-black tracking-[0.2em] flex items-center">Category</span>
                            <span className="text-[var(--foreground)] font-black text-sm">{product.categories?.name}</span>
                        </div>
                        {product.merchants && (
                            <div className="grid grid-cols-2 p-6 border-b border-[var(--border)] group hover:bg-[var(--background)] transition-colors">
                                <span className="text-gray-400 uppercase text-[10px] font-black tracking-[0.2em] flex items-center">Seller</span>
                                <span className="text-[var(--foreground)] font-black text-sm">{product.merchants.store_name}</span>
                            </div>
                        )}
                        <div className="grid grid-cols-2 p-6 group hover:bg-[var(--background)] transition-colors">
                            <span className="text-gray-400 uppercase text-[10px] font-black tracking-[0.2em] flex items-center">Status</span>
                            <span className="text-[#1b6b3e] font-black text-[10px] uppercase tracking-widest bg-green-50 dark:bg-green-950/30 px-3 py-1 rounded-full w-fit">Active Stock</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <h3 className="text-3xl font-black text-[var(--foreground)] flex items-center gap-4">
                        <div className="w-2 h-8 bg-[#1b6b3e] rounded-full shadow-lg shadow-[#1b6b3e]/30"></div>
                        Product Description
                    </h3>
                    <div className="prose prose-green dark:prose-invert max-w-none text-gray-500 dark:text-gray-400 font-bold leading-relaxed space-y-6 text-lg">
                        <div 
                            className="bg-[var(--card)] p-10 rounded-[40px] border border-[var(--border)] shadow-sm"
                            dangerouslySetInnerHTML={{ __html: product.description.replace(/BigHaat/gi, 'Agrinex') }} 
                        />
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 space-y-12">
                <div className="bg-gradient-to-br from-[#1b6b3e] to-[#0f4a29] text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden group sticky top-32">
                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-700"><MessageSquare size={160} /></div>
                    <div className="relative z-10">
                        <div className="w-16 h-1 bg-white/30 rounded-full mb-8"></div>
                        <h4 className="text-2xl font-black uppercase tracking-widest mb-6 leading-tight">Quality<br />Guarantee</h4>
                        <p className="text-base font-bold italic opacity-90 leading-relaxed mb-8">
                            "Every product on Agrinex is 100% genuine and sourced directly from manufacturers or authorized partners."
                        </p>
                        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/10">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg"><ShieldCheck className="text-[#1b6b3e]" /></div>
                            <span className="text-xs font-black uppercase tracking-widest">Verified Marketplace</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Similar Products */}
        {relatedProducts.length > 0 && (
            <div className="mt-32 space-y-10">
                <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-black text-[var(--foreground)]">Similar Products</h3>
                    <Link href={`/products?category=${encodeURIComponent(product.categories?.name)}`} className="text-[#1b6b3e] font-black uppercase tracking-widest text-xs hover:underline flex items-center gap-2">View All <ChevronRight size={16} /></Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {relatedProducts.map((p: any) => {
                        const prodId = p.product_id || p.id;
                        const prodName = p.product_name || p.name;
                        const prodCat = p.category || p.categories?.name;
                        return (
                            <Link key={prodId} href={`/product/${prodId}`} className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-3xl hover:shadow-2xl transition-all group cursor-pointer block">
                                <div className="h-40 bg-[var(--background)] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform overflow-hidden p-4">
                                    <img src={p.image_url} alt={prodName} className="w-full h-full object-contain" />
                                </div>
                                <p className="text-[10px] font-black text-[#1b6b3e] uppercase tracking-widest mb-1">{prodCat}</p>
                                <h4 className="text-sm font-black text-[var(--foreground)] mb-4 line-clamp-2">{prodName}</h4>
                                <div className="flex items-center justify-between">
                                    <span className="font-black text-lg text-[var(--foreground)]">₹{Number(p.price)}</span>
                                    <span className="text-[10px] font-black text-orange-500">SALE</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductPage;
