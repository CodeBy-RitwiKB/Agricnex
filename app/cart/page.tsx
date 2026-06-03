"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  Trash2, Plus, Minus, ChevronRight, ShoppingBag, 
  ShieldCheck, ArrowLeft, Truck, PhoneCall, Zap, CheckCircle2 
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { useCart } from "@/context/CartContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const CartPage = () => {
  const { cart, updateQuantity, removeItem, totalAmount, cartCount, addItem } = useCart();
  const [dbDetails, setDbDetails] = useState<any[]>([]);
  const [allCrossSells, setAllCrossSells] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch fresh details from DB to ensure prices are up to date
  useEffect(() => {
    if (cart.length === 0) return;

    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const ids = cart.map(item => item.id).join(',');
        const res = await fetch(`/api/products/bulk?ids=${ids}`);
        const data = await res.json();
        if (data.success) {
          setDbDetails(data.data);
        }
      } catch (err) {
        console.error("Error fetching cart details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [cart.length]);

  // Fetch cross-sell recommendations based on cart categories
  useEffect(() => {
    if (dbDetails.length === 0) return;

    const categories = Array.from(
      new Set(dbDetails.map((d: any) => d.categories?.name).filter(Boolean))
    );

    console.log("Resolved Cart Categories for ML:", categories);

    if (categories.length === 0) return;

    const fetchCrossSells = async () => {
      try {
        const res = await fetch(
          `/api/ai/ml?type=crosssell&categories=${encodeURIComponent(categories.join(","))}`
        );
        const json = await res.json();
        console.log("ML Cross-sell API returned:", json);
        if (json.success && json.data?.products) {
          // Shuffling/randomizing the full suggestions list
          const shuffled = [...json.data.products].sort(() => 0.5 - Math.random());
          setAllCrossSells(shuffled);
        }
      } catch (err) {
        console.error("Error fetching cross-sells:", err);
      }
    };

    fetchCrossSells();
  }, [dbDetails]);

  // Filter out products currently in cart, then show the top 3 remaining ones
  const cartIds = new Set(cart.map(item => item.id));
  const visibleCrossSells = allCrossSells.filter(p => !cartIds.has(p.product_id)).slice(0, 3);

  // Filter and Map cart items with their original prices from DB if available
  const standardItems = cart.filter(item => !item.isBuyNow).map(item => {
    const details = dbDetails.find(d => d.id === item.id);
    return {
      ...item,
      image_url: details?.image_url || item.image_url,
      originalPrice: details?.originalPrice || item.price * 1.2,
      brand: details?.categories?.name || "Agriculture"
    };
  });

  const buyNowItems = cart.filter(item => item.isBuyNow).map(item => {
    const details = dbDetails.find(d => d.id === item.id);
    return {
      ...item,
      image_url: details?.image_url || item.image_url,
      originalPrice: details?.originalPrice || item.price * 1.2,
      brand: details?.categories?.name || "Agriculture"
    };
  });

  const subtotal = totalAmount;
  const originalSubtotal = [...standardItems, ...buyNowItems].reduce((acc, item) => acc + item.originalPrice * item.quantity, 0);
  const discount = originalSubtotal - subtotal;
  const deliveryFee = subtotal > 999 || subtotal === 0 ? 0 : 99;
  const total = subtotal + deliveryFee;


  return (
    <div className="bg-[var(--background)] min-h-screen transition-colors duration-500">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-10">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-3 text-gray-400 hover:text-[#1b6b3e] transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center group-hover:border-[#1b6b3e] group-hover:bg-[#1b6b3e]/5">
              <ArrowLeft size={20} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest hidden md:block">Back to Shopping</span>
          </button>
          <h1 className="text-4xl font-black text-[var(--foreground)] flex items-center gap-4">
            My Shopping Cart <span className="text-xl text-gray-400 font-bold">({isMounted ? cartCount : 0} Items)</span>
          </h1>
        </div>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Cart Items */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Buy Now Section */}
              {buyNowItems.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl w-fit">
                    <Zap className="text-orange-500" size={18} fill="currentColor" />
                    <span className="text-xs font-black text-orange-600 uppercase tracking-widest">Buy Now Items</span>
                  </div>
                  {buyNowItems.map((item) => (
                    <div key={item.id + "-buynow"} className="bg-[var(--card)] p-6 rounded-[32px] border-2 border-orange-500/30 shadow-lg shadow-orange-500/5 hover:shadow-xl transition-all group relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl -mr-12 -mt-12"></div>
                       <div className="flex flex-col md:flex-row gap-8 relative z-10">
                        <div className="w-full md:w-40 h-40 bg-[var(--background)] rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform border border-[var(--border)] overflow-hidden">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-contain p-4" />
                          ) : (
                            <span className="text-4xl">🌱</span>
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">{item.brand}</p>
                              <h3 className="text-lg font-black text-[var(--foreground)] leading-tight">{item.name}</h3>
                              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle2 size={12} className="text-green-500" /> Priority Checkout Enabled
                              </p>
                            </div>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors p-2"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                            <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-2xl p-1">
                              <button 
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-10 text-center font-black text-sm text-[var(--foreground)]">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                              >
                                <Plus size={16} />
                              </button>
                            </div>

                            <div className="text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <span className="text-xl font-black text-[var(--foreground)]">₹{isMounted ? (item.price * item.quantity).toLocaleString() : "0.00"}</span>
                                <span className="text-xs text-gray-400 line-through">₹{isMounted ? (item.originalPrice * item.quantity).toLocaleString() : "0.00"}</span>
                              </div>
                              <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Save ₹{isMounted ? ((item.originalPrice - item.price) * item.quantity).toLocaleString() : "0.00"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Standard Cart Section */}
              {standardItems.length > 0 && (
                <div className="space-y-6">
                  {buyNowItems.length > 0 && (
                    <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800/50 p-4 rounded-2xl w-fit mt-10">
                      <ShoppingBag className="text-gray-400" size={18} />
                      <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Standard Shopping Cart</span>
                    </div>
                  )}
                  {standardItems.map((item) => (
                    <div key={item.id} className="bg-[var(--card)] p-6 rounded-[32px] border border-[var(--border)] shadow-sm hover:shadow-xl transition-all group">
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-40 h-40 bg-[var(--background)] rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform border border-[var(--border)] overflow-hidden">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-contain p-4" />
                          ) : (
                            <span className="text-4xl">🌱</span>
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] font-black text-[#1b6b3e] uppercase tracking-widest mb-1">{item.brand}</p>
                              <h3 className="text-lg font-black text-[var(--foreground)] leading-tight">{item.name}</h3>
                              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Premium Selection</p>
                            </div>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors p-2"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                            <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-2xl p-1">
                              <button 
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-10 text-center font-black text-sm text-[var(--foreground)]">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                              >
                                <Plus size={16} />
                              </button>
                            </div>

                            <div className="text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <span className="text-xl font-black text-[var(--foreground)]">₹{isMounted ? (item.price * item.quantity).toLocaleString() : "0.00"}</span>
                                <span className="text-xs text-gray-400 line-through">₹{isMounted ? (item.originalPrice * item.quantity).toLocaleString() : "0.00"}</span>
                              </div>
                              <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Save ₹{isMounted ? ((item.originalPrice - item.price) * item.quantity).toLocaleString() : "0.00"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-green-50/50 dark:bg-green-950/10 p-6 rounded-3xl border border-green-100 dark:border-green-900/30 flex items-center gap-4">
                <Truck className="text-[#1b6b3e]" />
                <p className="text-sm font-bold text-[#1b6b3e]">
                  {deliveryFee === 0 
                    ? "Your order qualifies for FREE Delivery!" 
                    : `Add ₹${(1000 - subtotal).toLocaleString()} more for FREE Delivery.`}
                </p>
              </div>

              {/* Amazon/Flipkart Frequently Bought Together recommendations */}
              {visibleCrossSells.length > 0 && (
                <div className="bg-[var(--card)] p-8 rounded-[40px] border border-[var(--border)] shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center gap-2 border-b border-[var(--border)] pb-4">
                    <Zap className="text-[#ff9900]" size={20} fill="currentColor" />
                    <h3 className="text-md font-black text-[var(--foreground)] uppercase tracking-widest">
                      Frequently Bought Together (Recommended)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {visibleCrossSells.map((product) => (
                      <div key={product.product_id} className="p-4 rounded-3xl bg-[var(--background)] border border-[var(--border)] flex flex-col justify-between group hover:border-[#1b6b3e]/30 transition-all animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-full h-32 flex items-center justify-center overflow-hidden rounded-2xl bg-[var(--card)] border border-[var(--border)] p-2">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.product_name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <span className="text-3xl">🌱</span>
                          )}
                        </div>
                        <div className="mt-4 space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-[9px] font-bold text-[#ff9900] uppercase tracking-wider">{product.category}</p>
                            <p className="text-xs font-black text-[var(--foreground)] uppercase tracking-tight line-clamp-2 mt-0.5">{product.product_name}</p>
                          </div>
                          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                            <span className="text-sm font-black text-[var(--foreground)]">₹{product.price}</span>
                            <button
                              onClick={() => {
                                addItem({
                                  id: product.product_id,
                                  name: product.product_name,
                                  price: product.price,
                                  image_url: product.image_url
                                }, 1);
                              }}
                              className="px-3.5 py-2 bg-[#1b6b3e] hover:bg-[#15522e] text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-[var(--card)] p-8 rounded-[40px] border border-[var(--border)] shadow-sm space-y-6">
                <h2 className="text-xl font-black text-[var(--foreground)] uppercase tracking-widest border-b border-[var(--border)] pb-4">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-gray-500">Cart Subtotal</span>
                    <span className="text-[var(--foreground)]">₹{originalSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#1b6b3e]">
                    <span>Product Discount</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-gray-500">Delivery Fee</span>
                    <span className={cn(deliveryFee === 0 ? "text-[#1b6b3e]" : "text-[var(--foreground)]")}>
                      {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--border)] flex justify-between items-center">
                  <span className="text-lg font-black text-[var(--foreground)] uppercase tracking-widest">Total Amount</span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-[#1b6b3e]">₹{isMounted ? total.toLocaleString() : "0.00"}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Includes GST & All Taxes</p>
                  </div>
                </div>

                <Link href="/checkout">
                  <button className="w-full bg-[#1b6b3e] text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-sm shadow-2xl shadow-[#1b6b3e]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4">
                    Proceed To Checkout <ChevronRight size={18} />
                  </button>
                </Link>

                <div className="flex items-center justify-center gap-4 pt-4">
                    <div className="flex flex-col items-center gap-1">
                        <ShieldCheck size={20} className="text-blue-500" />
                        <span className="text-[8px] font-black text-gray-400 uppercase">Secure Payment</span>
                    </div>
                    <div className="w-px h-6 bg-[var(--border)]"></div>
                    <div className="flex flex-col items-center gap-1">
                        <Truck size={20} className="text-green-500" />
                        <span className="text-[8px] font-black text-gray-400 uppercase">Tracked Delivery</span>
                    </div>
                </div>
              </div>

              {/* Need Help? */}
              <div className="bg-orange-50 dark:bg-orange-950/20 p-8 rounded-[40px] border border-orange-100 dark:border-orange-900/30 text-center">
                <PhoneCall size={32} className="text-[#ff9900] mx-auto mb-4" />
                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-2">Need help with your order?</h4>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">Our Agri-Experts are here to assist you with products or payment issues.</p>
                <button className="text-[#ff9900] font-black uppercase tracking-widest text-xs hover:underline flex items-center gap-2 mx-auto">
                    Call 1800-3000-2434 <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--card)] p-20 rounded-[48px] border border-[var(--border)] text-center shadow-sm">
            <div className="w-24 h-24 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-8 text-6xl shadow-inner border border-[var(--border)]">
              🛒
            </div>
            <h2 className="text-3xl font-black text-[var(--foreground)] mb-4 uppercase tracking-tighter">Your cart is feeling light!</h2>
            <p className="text-gray-500 font-bold mb-10 max-w-md mx-auto leading-relaxed">Looks like you haven't added any seeds or farming equipment to your cart yet. Let's grow something great together!</p>
            <Link href="/">
              <button className="bg-[#1b6b3e] text-white px-10 py-5 rounded-[24px] font-black uppercase tracking-widest text-sm shadow-2xl shadow-[#1b6b3e]/30 hover:scale-105 transition-all">
                Start Shopping Now
              </button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
