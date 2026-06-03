"use client";

import React, { useState } from "react";
import {
  ArrowLeft, MapPin, CreditCard, Truck,
  ChevronRight, ShieldCheck, CheckCircle2,
  Phone, User, Home as HomeIcon, Zap
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const CheckoutPage = () => {
  const { cart, totalAmount, cartCount, clearCart } = useCart();
  const { data: session, isPending } = useSession();
  const [dbDetails, setDbDetails] = useState<any[]>([]);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderSummary, setOrderSummary] = useState<any[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    fieldAddress: "",
    city: "",
    pincode: ""
  });
  const [errors, setErrors] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!isPending && !session) {
      console.log("CheckoutPage: No session found. Setting auth-redirect to /checkout and pushing /login");
      if (typeof window !== "undefined") {
        localStorage.setItem("auth-redirect", "/checkout");
      }
      router.push("/login");
    }
  }, [session, isPending, router]);

  const handleAddressSubmit = () => {
    const newErrors = [];
    if (!address.fullName) newErrors.push("fullName");
    if (!address.phone) newErrors.push("phone");
    if (!address.fieldAddress) newErrors.push("fieldAddress");
    if (!address.city) newErrors.push("city");
    if (!address.pincode) newErrors.push("pincode");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    setStep(2);
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0 && step !== 3) {
      // router.push("/cart"); // Maybe too aggressive if they just finished an order
    }
  }, [cart.length]);

  // Fetch fresh details from DB
  useEffect(() => {
    if (cart.length === 0) return;

    const fetchDetails = async () => {
      try {
        const ids = cart.map(item => item.id).join(',');
        const res = await fetch(`/api/products/bulk?ids=${ids}`);
        const data = await res.json();
        if (data.success) {
          setDbDetails(data.data);
        }
      } catch (err) {
        console.error("Error fetching checkout details:", err);
      }
    };

    fetchDetails();
  }, [cart.length]);

  const subtotal = totalAmount;
  const itemsWithDetails = cart.map(item => {
    const details = dbDetails.find(d => d.id === item.id);
    return {
      ...item,
      image_url: details?.image_url || item.image_url,
      originalPrice: details?.originalPrice || item.price * 1.3
    };
  });

  const originalSubtotal = itemsWithDetails.reduce((acc, item) => acc + item.originalPrice * item.quantity, 0);
  const savings = originalSubtotal - subtotal;
  const deliveryFee = subtotal > 999 || subtotal === 0 ? 0 : 99;
  const totalPay = subtotal + deliveryFee;

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    if (!session?.user?.id) {
      alert("You must be logged in to place an order.");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const shippingAddressStr = `${address.fullName}, ${address.phone}, ${address.fieldAddress}, ${address.city} - ${address.pincode}`;
      
      const res = await fetch("/api/checkout/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          totalAmount: totalPay,
          paymentMethod,
          shippingAddress: shippingAddressStr,
          items: itemsWithDetails,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderSummary(itemsWithDetails);
        setOrderTotal(totalPay);
        setStep(3); // Success step
        clearCart();
      } else {
        alert(data.error || "Failed to process order.");
      }
    } catch (err) {
      console.error("Order error:", err);
      alert("Failed to connect to backend server.");
    } finally {
      setIsPlacingOrder(false);
    }
  };


  if (isPending) {
    return (
      <div className="bg-[var(--background)] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1b6b3e]"></div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="bg-[var(--background)] min-h-screen flex flex-col justify-between transition-colors duration-500">
        {/* Success header */}
        <div className="bg-[var(--card)] border-b border-[var(--border)] py-6 shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img
                src="https://res.cloudinary.com/dhpvb2emj/image/upload/q_auto/f_auto/v1778241361/logo.png"
                alt="Agrinex"
                className="h-8 w-auto select-none"
              />
              <span className="text-lg font-black tracking-tighter text-[#1b6b3e] uppercase">Agrinex</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#1b6b3e]" />
              <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">100% Secure Checkout</span>
            </div>
          </div>
        </div>

        {/* Success message body */}
        <main className="container mx-auto px-4 py-16 flex-1">
          <div className="max-w-2xl mx-auto text-center space-y-10">
            {/* Animated Big Green Checkmark */}
            <div className="relative w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/10 animate-bounce">
              <div className="absolute inset-0 rounded-full bg-green-500/5 blur-xl"></div>
              <CheckCircle2 size={48} className="text-green-500" />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-black uppercase tracking-tighter text-[var(--foreground)] animate-in fade-in slide-in-from-bottom-2 duration-500">Order Confirmed!</h1>
              <p className="text-gray-400 font-bold text-sm">
                Thank you for your purchase, <span className="text-[var(--foreground)]">{address.fullName}</span>! Your seeds & tools are on the way.
              </p>
              <div className="inline-block bg-[var(--card)] border border-[var(--border)] rounded-2xl px-6 py-3 font-bold text-xs uppercase tracking-widest text-[#1b6b3e]">
                Order Reference: #ANX-{Math.floor(100000 + Math.random() * 900000)}
              </div>
            </div>

            {/* Order summary card */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-8 shadow-sm space-y-6 text-left">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-[var(--border)] pb-4">Order Summary</h2>

              <div className="space-y-4 max-h-[200px] overflow-y-auto no-scrollbar">
                {orderSummary.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-[var(--background)] flex items-center justify-center text-xl border border-[var(--border)] overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-contain p-2" />
                      ) : (
                        <span>🌱</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-[#1b6b3e] uppercase line-clamp-1">{item.name}</p>
                      <p className="text-xs font-bold text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-black text-[var(--foreground)]">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-[var(--border)] space-y-4">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-400 uppercase">Payment Method</span>
                  <span className="text-[var(--foreground)] uppercase font-black">{paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-400 uppercase">Delivery Address</span>
                  <span className="text-[var(--foreground)] font-black text-right max-w-xs line-clamp-1">{address.fieldAddress}, {address.city}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
                  <span className="text-sm font-black text-[var(--foreground)] uppercase tracking-widest">Amount Paid</span>
                  <span className="text-xl font-black text-[#1b6b3e]">₹{orderTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="flex-1">
                <button className="w-full bg-[var(--card)] hover:bg-[#1b6b3e]/5 text-[var(--foreground)] hover:text-[#1b6b3e] border border-[var(--border)] py-5 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all active:scale-95 cursor-pointer">
                  Continue Shopping
                </button>
              </Link>
              <Link href="/user/dashboard" className="flex-1">
                <button className="w-full bg-[#1b6b3e] hover:bg-[#15522e] text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-[#1b6b3e]/20 active:scale-95 cursor-pointer">
                  View My Orders
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background)] min-h-screen transition-colors duration-500">
      {/* Mini Header */}
      <div className="bg-[var(--card)] border-b border-[var(--border)] py-6 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-3 text-gray-400 hover:text-[#1b6b3e] transition-all group"
          >
            <div className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center group-hover:border-[#1b6b3e] group-hover:bg-[#1b6b3e]/5">
              <ArrowLeft size={16} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">Back to Cart</span>
          </button>
          <div className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/dhpvb2emj/image/upload/q_auto/f_auto/v1778241361/logo.png"
              alt="Agrinex"
              className="h-8 w-auto select-none"
              onContextMenu={(e) => e.preventDefault()}
            />
            <span className="text-lg font-black tracking-tighter text-[#1b6b3e] uppercase">Agrinex</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#1b6b3e]" />
            <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">100% Secure Checkout</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Left: Steps */}
            <div className="lg:col-span-8 space-y-8">
              {/* Step 1: Delivery Address */}
              <div className={cn(
                "bg-[var(--card)] p-8 rounded-[40px] border transition-all duration-500",
                step === 1 ? "border-[#1b6b3e] shadow-2xl ring-4 ring-[#1b6b3e]/5" : "border-[var(--border)] opacity-60 shadow-sm"
              )}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-colors",
                      step === 1 ? "bg-[#1b6b3e] text-white" : "bg-[var(--background)] text-gray-400 border border-[var(--border)]"
                    )}>1</div>
                    <h2 className="text-xl font-black text-[var(--foreground)] uppercase tracking-widest">Delivery Address</h2>
                  </div>
                  {step > 1 && (
                    <button onClick={() => setStep(1)} className="text-[#1b6b3e] font-black text-xs uppercase tracking-widest hover:underline">Edit</button>
                  )}
                </div>

                {step === 1 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name *</label>
                      <div className="relative">
                        <User className={cn("absolute left-4 top-1/2 -translate-y-1/2", errors.includes("fullName") ? "text-red-500" : "text-gray-400")} size={18} />
                        <input
                          type="text"
                          value={address.fullName}
                          onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                          placeholder="e.g. Ramesh Kumar"
                          className={cn(
                            "w-full bg-[var(--background)] border rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:outline-none transition-all",
                            errors.includes("fullName") ? "border-red-500 ring-2 ring-red-500/10" : "border-[var(--border)] focus:border-[#1b6b3e]"
                          )}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number *</label>
                      <div className="relative">
                        <Phone className={cn("absolute left-4 top-1/2 -translate-y-1/2", errors.includes("phone") ? "text-red-500" : "text-gray-400")} size={18} />
                        <input
                          type="text"
                          value={address.phone}
                          onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className={cn(
                            "w-full bg-[var(--background)] border rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:outline-none transition-all",
                            errors.includes("phone") ? "border-red-500 ring-2 ring-red-500/10" : "border-[var(--border)] focus:border-[#1b6b3e]"
                          )}
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Field Address / Village *</label>
                      <div className="relative">
                        <HomeIcon className={cn("absolute left-4 top-1/2 -translate-y-1/2", errors.includes("fieldAddress") ? "text-red-500" : "text-gray-400")} size={18} />
                        <input
                          type="text"
                          value={address.fieldAddress}
                          onChange={(e) => setAddress({ ...address, fieldAddress: e.target.value })}
                          placeholder="Plot No, Near Water Tank, Village..."
                          className={cn(
                            "w-full bg-[var(--background)] border rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:outline-none transition-all",
                            errors.includes("fieldAddress") ? "border-red-500 ring-2 ring-red-500/10" : "border-[var(--border)] focus:border-[#1b6b3e]"
                          )}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Town / City *</label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        placeholder="e.g. Pune"
                        className={cn(
                          "w-full bg-[var(--background)] border rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none transition-all",
                          errors.includes("city") ? "border-red-500 ring-2 ring-red-500/10" : "border-[var(--border)] focus:border-[#1b6b3e]"
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pincode *</label>
                      <input
                        type="text"
                        value={address.pincode}
                        onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                        placeholder="411005"
                        className={cn(
                          "w-full bg-[var(--background)] border rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none transition-all",
                          errors.includes("pincode") ? "border-red-500 ring-2 ring-red-500/10" : "border-[var(--border)] focus:border-[#1b6b3e]"
                        )}
                      />
                    </div>
                    {errors.length > 0 && (
                      <p className="md:col-span-2 text-red-500 text-[10px] font-black uppercase tracking-widest text-center mt-2 animate-bounce">
                        ⚠️ Please fill all required fields marked with *
                      </p>
                    )}
                    <button
                      onClick={handleAddressSubmit}
                      className="md:col-span-2 bg-[#1b6b3e] text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl shadow-[#1b6b3e]/20 hover:scale-[1.01] active:scale-95 transition-all mt-4"
                    >
                      Confirm Address & Continue
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] border-dashed">
                    <MapPin className="text-[#1b6b3e] mt-1" size={20} />
                    <div>
                      <p className="font-black text-[var(--foreground)]">{address.fullName} <span className="text-gray-400 text-xs font-bold ml-2">{address.phone}</span></p>
                      <p className="text-xs font-bold text-gray-400 mt-1">{address.fieldAddress}, {address.city} - {address.pincode}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Payment Method */}
              <div className={cn(
                "bg-[var(--card)] p-8 rounded-[40px] border transition-all duration-500",
                step === 2 ? "border-[#1b6b3e] shadow-2xl ring-4 ring-[#1b6b3e]/5" : "border-[var(--border)] opacity-60 shadow-sm"
              )}>
                <div className="flex items-center gap-4 mb-8">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-colors",
                    step === 2 ? "bg-[#1b6b3e] text-white" : step > 2 ? "bg-green-500 text-white" : "bg-[var(--background)] text-gray-400 border border-[var(--border)]"
                  )}>{step > 2 ? <CheckCircle2 size={24} /> : "2"}</div>
                  <h2 className="text-xl font-black text-[var(--foreground)] uppercase tracking-widest">Payment Method</h2>
                </div>

                {step === 2 && (
                  <div className="space-y-4">
                    {[
                      { id: "cod", name: "Cash on Delivery", desc: "Pay at your field when products arrive", icon: "💵" },
                      { id: "upi", name: "UPI (PhonePe, GPay, Paytm)", desc: "Fast & Secure Digital Payment", icon: "⚡" },
                      { id: "card", name: "Debit / Credit Card", desc: "All banks supported", icon: "💳" }
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={cn(
                          "flex items-center justify-between p-6 rounded-3xl border-2 cursor-pointer transition-all hover:border-[#1b6b3e]/50",
                          paymentMethod === method.id ? "border-[#1b6b3e] bg-[#1b6b3e]/5 shadow-lg" : "border-[var(--border)] bg-[var(--background)]"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            name="payment"
                            className="w-5 h-5 accent-[#1b6b3e]"
                            checked={paymentMethod === method.id}
                            onChange={() => setPaymentMethod(method.id)}
                          />
                          <div>
                            <p className="font-black text-[var(--foreground)] text-sm flex items-center gap-2">
                              {method.name} <span className="text-xl">{method.icon}</span>
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{method.desc}</p>
                          </div>
                        </div>
                        {paymentMethod === method.id && <CheckCircle2 className="text-[#1b6b3e]" size={20} />}
                      </label>
                    ))}

                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className={cn(
                        "w-full text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-sm transition-all mt-6 flex items-center justify-center gap-3",
                        isPlacingOrder 
                          ? "bg-orange-500/50 cursor-not-allowed" 
                          : "bg-[#ff9900] shadow-2xl shadow-[#ff9900]/30 hover:scale-[1.01] active:scale-95 cursor-pointer"
                      )}
                    >
                      {isPlacingOrder ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white"></div>
                          Processing Order...
                        </>
                      ) : (
                        <>
                          Place Order & Pay <ChevronRight size={18} />
                        </>
                      )}
                    </button>

                    <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">By placing an order, you agree to our Terms of Service</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Order Details */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-[var(--card)] p-8 rounded-[40px] border border-[var(--border)] shadow-sm space-y-6">
                <h2 className="text-lg font-black text-[var(--foreground)] uppercase tracking-widest border-b border-[var(--border)] pb-4">Order Review</h2>

                <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                  {itemsWithDetails.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-[var(--background)] flex items-center justify-center text-2xl border border-[var(--border)] overflow-hidden">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-contain p-2" />
                        ) : (
                          <span>🌱</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-[#1b6b3e] uppercase line-clamp-1">{item.name}</p>
                        <p className="text-xs font-bold text-[var(--foreground)]">₹{isMounted ? item.price.toLocaleString() : "0.00"} x {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {cart.length === 0 && step !== 3 && (
                    <p className="text-center text-xs font-bold text-gray-400 py-8">Your cart is empty</p>
                  )}
                </div>

                <div className="pt-6 border-t border-[var(--border)] space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-400 uppercase">Subtotal</span>
                    <span className="text-[var(--foreground)] font-black">₹{isMounted ? subtotal.toLocaleString() : "0.00"}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-400 uppercase">Delivery</span>
                    <span className={cn(deliveryFee === 0 ? "text-[#1b6b3e]" : "text-[var(--foreground)]", "font-black")}>
                      {isMounted ? (deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`) : "..."}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-black text-[var(--foreground)] uppercase tracking-widest">Total Pay</span>
                    <span className="text-xl font-black text-[#1b6b3e]">₹{isMounted ? totalPay.toLocaleString() : "0.00"}</span>
                  </div>
                </div>

                {savings > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-950/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-3">
                    <Zap className="text-blue-500" size={18} fill="currentColor" />
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-tight">You are saving ₹{savings.toLocaleString()} on this order!</p>
                  </div>
                )}
              </div>

              {/* Security Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)] text-center">
                  <Truck className="text-[#1b6b3e] mx-auto mb-2" size={24} />
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Fast Delivery</p>
                </div>
                <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)] text-center">
                  <ShieldCheck className="text-blue-500 mx-auto mb-2" size={24} />
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Secured</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
