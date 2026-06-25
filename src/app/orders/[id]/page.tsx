"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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
  trackingNumber?: string;
  carrier?: string;
  timestamp: string;
}

interface OrderData {
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

function OrderDetailClient() {
  const { data: session, status } = useSession();
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=/orders/${id}`);
      return;
    }

    if (status === "authenticated" && id) {
      fetch(`/api/orders/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrder(data.data);
          } else {
            setError(data.error || "Failed to load order details");
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching order:", err);
          setError("An error occurred while loading the order details.");
          setLoading(false);
        });
    }
  }, [status, id, router]);

  const handleReorder = () => {
    if (!order) return;
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

  if (status === "loading" || loading) {
    return <OrderDetailSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-error text-6xl mb-4">error</span>
        <h1 className="text-2xl font-bold text-primary mb-2 font-serif">Order Details Error</h1>
        <p className="text-on-surface-variant max-w-md mb-6">{error || "The requested order could not be found."}</p>
        <Link href="/" className="px-5 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-secondary transition-all">
          Go Back Home
        </Link>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-surface">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-surface-container-low/85 backdrop-blur-md border-b border-soft-sage/10 shadow-xs">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center px-4 md:px-8 py-4">
          <Link href="/" className="font-bold text-xl text-primary font-serif">
            Stitch Veda <span className="text-secondary">Ayur</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="text-on-surface-variant hover:text-secondary transition-colors text-xs font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Profile Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-[800px] mx-auto px-4 md:px-6 py-10 space-y-8 font-sans">
        {/* Order Header Card */}
        <div className="bg-card-surface border border-soft-sage/20 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-bold text-cream-900/40 uppercase tracking-widest block">Customer Order Details</span>
            <h1 className="text-xl md:text-2xl font-bold text-primary-dark mt-1 font-serif">
              Order #{order._id.substring(0, 12)}
            </h1>
            <p className="text-xs text-on-surface-variant font-medium mt-1">Placed on {orderDate}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"} className="text-xs uppercase font-extrabold px-3 py-1">
              {order.paymentStatus}
            </Badge>
            <Badge variant="primary" className="text-xs uppercase font-extrabold px-3 py-1 bg-primary/10 text-primary border-none">
              {order.shippingStatus}
            </Badge>
          </div>
        </div>

        {/* Shipment Tracking Info Card */}
        {(order.trackingNumber || order.carrier || order.customerNote) && (
          <div className="bg-card-surface border border-soft-sage/20 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-primary font-serif uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-lg">local_shipping</span>
              Shipment Tracking Details
            </h2>
            <div className="bg-surface-container-low/70 p-4 rounded-xl border border-soft-sage/10 space-y-3 text-sm text-on-surface">
              {order.carrier && (
                <div className="flex justify-between items-center py-1">
                  <span className="font-bold text-primary">Carrier Partner</span>
                  <span className="font-semibold text-on-surface-variant">{order.carrier}</span>
                </div>
              )}
              {order.trackingNumber && (
                <div className="flex justify-between items-center py-1 border-t border-soft-sage/5">
                  <span className="font-bold text-primary">Tracking / LR Number</span>
                  <span className="font-mono text-secondary font-bold bg-secondary/5 px-2.5 py-1 rounded border border-secondary/15 select-all">
                    {order.trackingNumber}
                  </span>
                </div>
              )}
              {order.customerNote && (
                <div className="mt-2 pt-3 border-t border-soft-sage/10">
                  <span className="font-bold text-primary block mb-1 text-[11px] uppercase tracking-wider">Updates from Preparation Facility</span>
                  <p className="italic text-on-surface-variant font-semibold bg-white/50 p-3 rounded-lg border border-soft-sage/5 leading-relaxed">
                    "{order.customerNote}"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Execution Flow Timeline Card */}
        <div className="bg-card-surface border border-soft-sage/20 rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-primary font-serif uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-lg">timeline</span>
            Execution Progress Flow
          </h2>

          {/* Stepper progress */}
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
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold text-xs transition-all ${
                    isCompleted ? "bg-primary border-primary text-cream-50" : "bg-white border-cream-200 text-cream-900/30"
                  } ${isActive ? "ring-4 ring-primary/15 scale-110" : ""}`}>
                    {idx + 1}
                  </div>
                  <span className={`text-[10px] mt-2 font-bold ${isCompleted ? "text-primary-dark" : "text-cream-900/30"}`}>
                    {stepLabels[step as keyof typeof stepLabels]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* History Details */}
          <div className="border-t border-soft-sage/10 pt-4">
            {order.statusHistory && order.statusHistory.length > 0 ? (
              <div className="space-y-4 pl-2 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-soft-sage/10">
                {order.statusHistory.map((history, idx) => (
                  <div key={idx} className="flex gap-4 text-xs relative pl-6">
                    <div className="absolute left-[9px] top-1.5 w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                    <div className="flex-grow">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-primary capitalize">{history.status}</span>
                        <span className="text-[10px] text-cream-900/40 font-normal">
                          {new Date(history.timestamp).toLocaleString("en-IN")}
                        </span>
                      </div>
                      {history.note && (
                        <p className="mt-1 text-xs text-on-surface bg-soft-sage/5 p-2 rounded-lg border border-soft-sage/5 italic leading-relaxed">
                          "{history.note}"
                        </p>
                      )}
                      {(history.trackingNumber || history.carrier) && (
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {history.carrier && (
                            <span className="text-[10px] font-bold text-secondary bg-secondary/5 px-2 py-0.5 rounded border border-secondary/10">
                              Carrier: {history.carrier}
                            </span>
                          )}
                          {history.trackingNumber && (
                            <span className="text-[10px] font-bold text-primary-dark bg-primary/5 px-2 py-0.5 rounded border border-primary/10 select-all">
                              LR: {history.trackingNumber}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 pl-2 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-soft-sage/10">
                <div className="flex gap-4 text-xs relative pl-6">
                  <div className="absolute left-[9px] top-1.5 w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                  <div className="flex-grow">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-primary capitalize">pending</span>
                      <span className="text-[10px] text-cream-900/40 font-normal">
                        {new Date(order.createdAt).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-on-surface bg-soft-sage/5 p-2 rounded-lg border border-soft-sage/5 italic leading-relaxed">
                      "Order placed successfully. Pending facility confirmation."
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Items and Details */}
        <div className="bg-card-surface border border-soft-sage/20 rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-primary font-serif uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-lg">receipt_long</span>
            Order Prescription Items
          </h2>

          <div className="divide-y divide-cream-100">
            {order.products.map((item, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center text-sm font-semibold">
                <div className="text-cream-900">
                  {item.name}{" "}
                  <span className="text-[10px] text-cream-900/40 font-bold bg-cream-50 px-2 py-0.5 rounded border border-cream-100/50">
                    x{item.quantity}
                  </span>
                </div>
                <div className="text-primary-dark font-bold">
                  ₹{(item.priceAtPurchase * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-soft-sage/20 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold text-cream-900/40 uppercase tracking-wider block">Total Amount Paid</span>
              <span className="text-xl font-bold text-secondary">₹{order.totalAmount.toFixed(2)}</span>
            </div>
            <Button onClick={handleReorder} className="flex items-center gap-1.5 px-5 py-2.5 bg-secondary text-on-secondary hover:bg-primary transition-all">
              <span className="material-symbols-outlined text-sm font-bold">autorenew</span>
              Buy Again / Reorder All
            </Button>
          </div>
        </div>

        {/* Shipping Destination */}
        <div className="bg-card-surface border border-soft-sage/20 rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-primary font-serif uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-lg">home_pin</span>
            Shipping Destination
          </h2>
          <p className="text-xs text-cream-900/80 leading-relaxed font-semibold bg-surface-container-low/50 p-4 rounded-xl border border-soft-sage/5">
            {order.shippingAddress.street}, {order.shippingAddress.city}, <br />
            {order.shippingAddress.state} - {order.shippingAddress.zipCode} <br />
            <span className="text-[9px] uppercase font-bold text-cream-900/35 tracking-wider block mt-1">
              {order.shippingAddress.country}
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="min-h-screen bg-surface">
      <nav className="sticky top-0 z-50 bg-surface-container-low/85 border-b border-soft-sage/10">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center px-4 md:px-8 py-4">
          <div className="w-32 h-6 bg-soft-sage/15 rounded animate-pulse" />
          <div className="w-24 h-5 bg-soft-sage/10 rounded animate-pulse" />
        </div>
      </nav>
      <main className="max-w-[800px] mx-auto px-4 md:px-6 py-10 space-y-8">
        <div className="h-28 bg-soft-sage/10 rounded-2xl animate-pulse" />
        <div className="h-44 bg-soft-sage/10 rounded-2xl animate-pulse" />
        <div className="h-64 bg-soft-sage/10 rounded-2xl animate-pulse" />
      </main>
    </div>
  );
}

export default function DedicatedOrderPage() {
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetailClient />
    </Suspense>
  );
}
