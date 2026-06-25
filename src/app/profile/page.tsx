"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderItem {
  product: string;
  name: string;
  priceAtPurchase: number;
  quantity: number;
}

interface StatusHistoryItem {
  status: string;
  note?: string;
  timestamp: string;
}

interface Order {
  _id: string;
  totalAmount: number;
  paymentStatus: string;
  shippingStatus: string;
  createdAt: string;
  shippingAddress: Address;
  products: OrderItem[];
  trackingNumber?: string;
  carrier?: string;
  customerNote?: string;
  statusHistory?: StatusHistoryItem[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Address and Profile state
  const [address, setAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/profile");
      return;
    }

    if (status === "authenticated") {
      // Fetch Profile Address
      fetch("/api/users/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.address) {
            setAddress({
              street: data.data.address.street || "",
              city: data.data.address.city || "",
              state: data.data.address.state || "",
              zipCode: data.data.address.zipCode || "",
              country: data.data.address.country || "",
            });
          }
        })
        .catch((err) => console.error("Error loading profile details:", err));

      // Fetch Order History
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrders(data.data || []);
          }
          setIsLoadingOrders(false);
        })
        .catch((err) => {
          console.error("Error loading orders:", err);
          setIsLoadingOrders(false);
        });
    }
  }, [status, router]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAddress(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditingAddress(false);
      } else {
        alert(data.error || "Failed to update address");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleReorder = (order: Order) => {
    let currentCart: any[] = [];
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cart");
      if (stored) {
        try {
          currentCart = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse cart", e);
        }
      }

      for (const item of order.products) {
        const existingIndex = currentCart.findIndex((ci: any) => ci.id === item.product);
        if (existingIndex > -1) {
          currentCart[existingIndex].quantity += item.quantity;
        } else {
          currentCart.push({
            id: item.product,
            name: item.name,
            price: item.priceAtPurchase,
            quantity: item.quantity,
            stockQuantity: 99,
          });
        }
      }

      localStorage.setItem("cart", JSON.stringify(currentCart));
      window.location.href = "/?cartOpen=true";
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-secondary border-t-transparent rounded-full animate-spin" />
          <span className="text-on-surface-variant font-semibold text-sm">Loading your profile...</span>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const user = session?.user;
  const userRole = (user as any)?.role || "customer";
  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  const isAddressEmpty = !address.street && !address.city && !address.state && !address.zipCode;

  return (
    <div className="min-h-screen bg-surface">
      <nav className="sticky top-0 z-50 bg-surface-container-low/80 backdrop-blur-md shadow-sm">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center px-4 md:px-8 py-4">
          <Link href="/" className="font-bold text-2xl text-secondary">Pharmpill Biotech</Link>
          <Link href="/" className="text-on-surface-variant hover:text-secondary transition-colors text-sm font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Store
          </Link>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-12">
        {/* Profile Header */}
        <div className="bg-card-surface rounded-2xl border border-soft-sage/20 overflow-hidden shadow-sm mb-8">
          <div className="h-32 auth-botanical-bg relative"><div className="absolute inset-0 bg-black/10" /></div>
          <div className="px-8 pb-8 relative">
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-on-secondary text-3xl font-bold border-4 border-card-surface shadow-lg -mt-12 relative z-10">
              {userInitial}
            </div>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-primary">{userName}</h1>
                <p className="text-on-surface-variant mt-1">{userEmail}</p>
                <Badge variant="primary" className="mt-3 bg-secondary-container text-on-secondary-container border-none px-3 py-1 uppercase tracking-wider text-xs font-bold">
                  {userRole}
                </Badge>
              </div>
              <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2 border-error/30 text-error hover:bg-error-container/30 self-start">
                <span className="material-symbols-outlined text-lg">logout</span>
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Account Details */}
            <div className="bg-card-surface rounded-2xl border border-soft-sage/20 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">person</span>
                Account Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: "Full Name", value: userName, icon: "badge" },
                  { label: "Email", value: userEmail, icon: "mail" },
                  { label: "Account Type", value: userRole.charAt(0).toUpperCase() + userRole.slice(1), icon: "shield" },
                  { label: "Member Since", value: new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long" }), icon: "calendar_month" },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary-container/30 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-secondary text-xl">{item.icon}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">{item.label}</span>
                      <span className="text-sm font-semibold text-on-surface mt-0.5 block">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address Management */}
            <div className="bg-card-surface rounded-2xl border border-soft-sage/20 p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">home_pin</span>
                  Delivery Address
                </h2>
                {!isEditingAddress && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingAddress(true)}
                    className="flex items-center gap-1.5 text-xs font-bold border-secondary/35 text-secondary"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    {isAddressEmpty ? "Add Address" : "Change"}
                  </Button>
                )}
              </div>

              {isEditingAddress ? (
                <form onSubmit={handleSaveAddress} className="space-y-4 font-sans">
                  <div>
                    <label className="text-xs font-bold text-cream-900/60 block mb-1.5 uppercase tracking-wide">Street Address</label>
                    <Input
                      required
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      placeholder="Flat No, Apartment, Street Name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-cream-900/60 block mb-1.5 uppercase tracking-wide">City</label>
                      <Input
                        required
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-cream-900/60 block mb-1.5 uppercase tracking-wide">State</label>
                      <Input
                        required
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        placeholder="State"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-cream-900/60 block mb-1.5 uppercase tracking-wide">Postal / Zip Code</label>
                      <Input
                        required
                        value={address.zipCode}
                        onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                        placeholder="Pin Code"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-cream-900/60 block mb-1.5 uppercase tracking-wide">Country</label>
                      <Input
                        required
                        value={address.country}
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                        placeholder="Country"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" isLoading={isSavingAddress} className="bg-secondary hover:bg-primary font-bold">
                      Save Address
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditingAddress(false)}
                      className="border-cream-300 hover:bg-cream-100 text-cream-900/80 font-bold"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="font-sans">
                  {isAddressEmpty ? (
                    <div className="p-4 bg-cream-50/50 border border-dashed border-cream-300 rounded-xl text-center">
                      <span className="material-symbols-outlined text-4xl text-soft-sage mb-2 block">location_off</span>
                      <p className="text-sm text-cream-900/60 font-medium">No saved delivery address.</p>
                      <p className="text-[11px] text-cream-900/40 mt-0.5">Please add your address to speed up checkouts.</p>
                    </div>
                  ) : (
                    <div className="p-5 bg-surface-container-low border border-soft-sage/10 rounded-xl flex gap-3 items-start">
                      <span className="material-symbols-outlined text-secondary text-2xl mt-0.5">location_on</span>
                      <div className="text-sm text-cream-900/90 leading-relaxed font-semibold">
                        <p>{address.street}</p>
                        <p>{address.city}, {address.state} - {address.zipCode}</p>
                        <p className="text-xs text-cream-900/50 mt-1 uppercase tracking-wider font-bold">{address.country}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Orders */}
            <div className="bg-card-surface rounded-2xl border border-soft-sage/20 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">receipt_long</span>
                Order History
              </h2>

              {isLoadingOrders ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-cream-900/40 font-bold uppercase tracking-wider">Syncing Ledger...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant font-sans">
                  <span className="material-symbols-outlined text-5xl text-soft-sage mb-4 block">inventory_2</span>
                  <p className="font-semibold mb-1">No orders yet</p>
                  <p className="text-sm">Explore our <Link href="/" className="text-secondary font-bold hover:underline">product catalog</Link> to find authentic remedies.</p>
                </div>
              ) : (
                <div className="space-y-4 font-sans">
                  {orders.map((order) => {
                    const isExpanded = expandedOrders[order._id] || false;
                    const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <div key={order._id} className="border border-soft-sage/25 rounded-xl overflow-hidden bg-surface-container-low/50">
                        {/* Summary Header */}
                        <div
                          onClick={() => toggleOrderExpand(order._id)}
                          className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-soft-sage/5 transition-colors"
                        >
                          <div>
                            <span className="text-[10px] font-bold text-cream-900/40 uppercase tracking-wider">ID: #{order._id}</span>
                            <div className="flex items-center gap-2.5 mt-1">
                              <span className="font-bold text-sm text-primary-dark">{orderDate}</span>
                              <span className="text-xs text-cream-900/40">•</span>
                              <span className="font-extrabold text-sm text-secondary">₹{order.totalAmount.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"} className="text-[10px] uppercase font-bold">
                              {order.paymentStatus}
                            </Badge>
                            <Badge variant="primary" className="text-[10px] uppercase font-bold bg-primary/10 text-primary border-none">
                              {order.shippingStatus}
                            </Badge>
                            <span className={`material-symbols-outlined text-cream-900/40 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                              expand_more
                            </span>
                          </div>
                        </div>

                        {/* Detailed Subcontent */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-3 border-t border-soft-sage/10 bg-white/60 divide-y divide-cream-100">
                            {/* Items */}
                            <div className="py-3.5 space-y-2.5">
                              <h4 className="text-[10px] font-bold text-cream-900/40 uppercase tracking-widest mb-2">Items Ordered</h4>
                              {order.products.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs font-semibold">
                                  <div className="text-cream-900">
                                    {item.name} <span className="text-[10px] text-cream-900/40 font-bold">x{item.quantity}</span>
                                  </div>
                                  <div className="text-primary-dark font-bold">
                                    ₹{(item.priceAtPurchase * item.quantity).toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Delivery details */}
                            <div className="py-3.5 flex flex-col md:flex-row gap-4 justify-between">
                              <div>
                                <h4 className="text-[10px] font-bold text-cream-900/40 uppercase tracking-widest mb-1.5">Shipping Destination</h4>
                                <p className="text-xs text-cream-900/80 leading-relaxed font-semibold">
                                  {order.shippingAddress.street}, {order.shippingAddress.city}, <br />
                                  {order.shippingAddress.state} - {order.shippingAddress.zipCode} <br />
                                  <span className="text-[9px] uppercase font-bold text-cream-900/35 tracking-wider">{order.shippingAddress.country}</span>
                                </p>
                              </div>

                              <div className="text-xs font-bold text-cream-900/40 flex flex-col items-end gap-2">
                                <p className="flex justify-between md:justify-end gap-4">
                                  <span>Payment Mode:</span>
                                  <span className="text-primary-dark font-semibold">Razorpay Checkout</span>
                                </p>
                                <div className="flex gap-2 mt-1">
                                  <Link
                                    href={`/orders/${order._id}`}
                                    className="px-4 py-2 border border-secondary/20 hover:border-secondary text-secondary hover:bg-secondary/5 font-bold rounded-lg text-xs transition-all flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-[14px] font-bold">open_in_new</span>
                                    Track Page
                                  </Link>
                                  <button
                                    onClick={() => handleReorder(order)}
                                    className="px-4 py-2 bg-secondary hover:bg-primary text-on-secondary font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                                  >
                                    <span className="material-symbols-outlined text-[14px] font-bold">autorenew</span>
                                    Buy Again
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Shipment tracking and notes */}
                            {(order.trackingNumber || order.carrier || order.customerNote) && (
                              <div className="py-3.5 space-y-2">
                                <h4 className="text-[10px] font-bold text-cream-900/40 uppercase tracking-widest">Shipment Tracking Info</h4>
                                <div className="bg-surface-container-low/70 p-3.5 rounded-xl border border-soft-sage/10 space-y-2.5 text-xs text-on-surface">
                                  {order.carrier && (
                                    <div className="flex gap-2">
                                      <span className="font-bold text-primary">Carrier Partner:</span>
                                      <span className="font-semibold text-on-surface-variant">{order.carrier}</span>
                                    </div>
                                  )}
                                  {order.trackingNumber && (
                                    <div className="flex gap-2">
                                      <span className="font-bold text-primary">Tracking Number:</span>
                                      <span className="font-mono text-secondary font-bold bg-secondary/5 px-2 py-0.5 rounded border border-secondary/10 select-all">{order.trackingNumber}</span>
                                    </div>
                                  )}
                                  {order.customerNote && (
                                    <div className="mt-1 pt-1.5 border-t border-soft-sage/5">
                                      <span className="font-bold text-primary block mb-1 text-[10px] uppercase tracking-wider">Updates from Facility:</span>
                                      <p className="italic text-on-surface-variant font-medium bg-white/40 p-2.5 rounded border border-soft-sage/5">
                                        "{order.customerNote}"
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Progress Flow timeline */}
                            <div className="py-3.5 space-y-3.5">
                              <h4 className="text-[10px] font-bold text-cream-900/40 uppercase tracking-widest">Execution Progress Flow</h4>
                              
                              <div className="grid grid-cols-4 gap-2 text-center max-w-md mx-auto py-2">
                                {["pending", "processing", "shipped", "delivered"].map((step, idx) => {
                                  const stepLabels = {
                                    pending: "Ordered",
                                    processing: "Preparing",
                                    shipped: "Shipped",
                                    delivered: "Delivered",
                                  };
                                  const statusSteps = ["pending", "processing", "shipped", "delivered"];
                                  const currentStepIndex = statusSteps.indexOf(order.shippingStatus || "pending");
                                  const isCompleted = idx <= currentStepIndex;
                                  const isActive = idx === currentStepIndex;
                                  
                                  return (
                                    <div key={step} className="flex flex-col items-center">
                                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border font-bold text-xs transition-all ${
                                        isCompleted ? "bg-primary border-primary text-cream-50" : "bg-white border-cream-200 text-cream-900/30"
                                      } ${isActive ? "ring-2 ring-primary/20 scale-105" : ""}`}>
                                        {idx + 1}
                                      </div>
                                      <span className={`text-[10px] mt-1.5 font-bold ${isCompleted ? "text-primary-dark" : "text-cream-900/30"}`}>
                                        {stepLabels[step as keyof typeof stepLabels]}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>

                              {order.statusHistory && order.statusHistory.length > 0 ? (
                                <div className="space-y-3 pl-2 mt-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-soft-sage/10">
                                  {order.statusHistory.map((history: any, idx: number) => (
                                    <div key={idx} className="flex gap-4 text-xs relative pl-6">
                                      <div className="absolute left-[9px] top-1.5 w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                                      <div className="flex-grow">
                                        <div className="flex items-center justify-between font-bold">
                                          <span className="text-primary capitalize">{history.status}</span>
                                          <span className="text-[10px] text-cream-900/40 font-normal">{new Date(history.timestamp).toLocaleString("en-IN")}</span>
                                        </div>
                                        {history.note && (
                                          <p className="mt-1 text-xs text-on-surface bg-white/40 p-2 rounded italic">
                                            "{history.note}"
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-cream-900/40 italic pl-2">Pending confirmation and assembly.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 font-sans">
            <div className="bg-card-surface rounded-2xl border border-soft-sage/20 p-6 shadow-sm">
              <h3 className="text-xs font-bold text-primary mb-4 uppercase tracking-widest">Quick Actions</h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Browse Remedies", icon: "spa", href: "/" },
                ].map((action) => (
                  <Link key={action.label} href={action.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-soft-sage/10 transition-all text-on-surface-variant hover:text-secondary group">
                    <span className="material-symbols-outlined text-xl text-soft-sage group-hover:text-secondary transition-colors">{action.icon}</span>
                    <span className="text-sm font-semibold">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="bg-secondary rounded-2xl p-6 text-on-secondary">
              <span className="material-symbols-outlined text-3xl mb-3 block">support_agent</span>
              <h3 className="font-bold text-lg mb-2">Need Help?</h3>
              <p className="text-sm text-on-secondary/80 mb-4 leading-relaxed">Our Ayurvedic wellness consultants are available to guide your health journey.</p>
              <button className="w-full py-2.5 bg-white/15 hover:bg-white/25 rounded-lg text-sm font-semibold transition-all">Contact Support</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
