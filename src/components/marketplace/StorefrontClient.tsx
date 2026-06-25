"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { CartDrawer, CartItem } from "@/components/marketplace/CartDrawer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ProductData } from "@/lib/product-data";

interface StorefrontProps {
  products: ProductData[];
  categories: string[];
  featuredProduct: ProductData | null;
}

export default function StorefrontClient({
  products,
  categories,
  featuredProduct,
}: StorefrontProps) {
  const { data: session } = useSession();
  const router = useRouter();

  // State
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [checkoutTotal, setCheckoutTotal] = useState(0);

  // Shipping Address state
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(false);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  // Fetch saved profile address and recent orders when session is active
  useEffect(() => {
    if (session?.user) {
      // Fetch profile address
      fetch("/api/users/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.address) {
            const addr = data.data.address;
            if (addr.street || addr.city || addr.state || addr.zipCode) {
              setShippingAddress({
                street: addr.street || "",
                city: addr.city || "",
                state: addr.state || "",
                zipCode: addr.zipCode || "",
                country: addr.country || "India",
              });
            }
          }
        })
        .catch((err) => console.error("Error fetching address:", err));

      // Fetch recent orders
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setRecentOrders(data.data);
          }
        })
        .catch((err) => console.error("Error fetching recent orders:", err));
    } else {
      setRecentOrders([]);
    }
  }, [session]);

  // Auto-redirect admin and factory users
  useEffect(() => {
    if (session?.user) {
      const role = (session.user as any).role;
      if (role === "admin") {
        router.push("/admin");
      } else if (role === "factory") {
        router.push("/factory");
      }
    }
  }, [session, router]);

  // All category labels (dynamic from DB)
  const allCategories = useMemo(() => ["All", ...categories], [categories]);

  // Filtered Products
  const filteredProducts = useMemo(
    () =>
      selectedCategory === "All"
        ? products
        : products.filter((p) => p.categories.includes(selectedCategory)),
    [products, selectedCategory]
  );

  // Handlers
  const handleAddToCart = (product: ProductData, e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stockQuantity <= 0) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(item.stockQuantity, item.quantity + 1),
              }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            stockQuantity: product.stockQuantity,
            imageUrl: product.imageUrls[0],
          },
        ];
      }
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (id: string, newQty: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleStartCheckout = () => {
    if (cart.length === 0) return;

    // Require user to be logged in
    if (!session?.user) {
      alert("Please sign in to proceed to checkout.");
      router.push("/auth/signin?callbackUrl=/");
      return;
    }

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setCheckoutTotal(total);
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const handlePayWithRazorpay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPaying) return;
    setIsPaying(true);

    try {
      // 1. Save address to profile if checked
      if (saveAddressToProfile) {
        await fetch("/api/users/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: shippingAddress }),
        });
      }

      // 2. Create pending order in database
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
          shippingAddress,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create order");
      }
      const dbOrder = orderData.data;

      // 3. Initiate Razorpay Order
      const rzpRes = await fetch("/api/payments/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: dbOrder._id }),
      });
      const rzpData = await rzpRes.json();
      if (!rzpData.success) {
        throw new Error(rzpData.error || "Failed to initiate payment");
      }

      // 4. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay script could not be loaded. Please check your internet connection.");
      }

      // 5. Open Razorpay checkout options
      const options = {
        key: rzpData.keyId,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: "Pharmpill Biotech",
        description: "Ayurvedic Remedies Purchase",
        order_id: rzpData.rzpOrderId,
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        handler: async function (response: any) {
          try {
            setIsPaying(true);
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setCart([]);
              setIsCheckoutModalOpen(false);
              alert("Payment completed successfully! Order placed.");
              router.push("/profile");
            } else {
              alert("Payment verification failed: " + verifyData.error);
            }
          } catch (err: any) {
            alert("Error verifying payment: " + err.message);
          } finally {
            setIsPaying(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsPaying(false);
          },
        },
        theme: {
          color: "#1B3B36",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "An error occurred during payment initiation");
      setIsPaying(false);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Navbar with cart integration */}
      <Navbar
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-surface-container-low py-20 px-6 md:px-12 border-b border-soft-sage/10">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[140%] bg-soft-sage/10 organic-shape blur-3xl" />
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">spa</span>
              Authentic Ayurvedic Remedies
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-[1.1] font-serif">
              Rooted in Tradition, <br />
              <span className="text-secondary">Refined by Science.</span>
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed font-serif max-w-xl">
              Discover pure botanical formulations, handcrafted from
              high-altitude wild herbs and tested for clinical efficacy to bring
              your doshas into perfect harmony.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="#catalog"
                className="px-6 py-3.5 bg-secondary text-on-secondary rounded-lg font-semibold hover:bg-primary shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
              >
                Shop Remedies
              </a>
            </div>
          </div>

          {/* Featured Hero Image */}
          <div className="relative aspect-video lg:aspect-square w-full rounded-2xl overflow-hidden shadow-xl border border-soft-sage/10 group">
            <Image
              src={
                featuredProduct?.imageUrls[0] ||
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDGF68ViWIxhJYciECVlPl8NYTz1yPpOemtk0I-e4kbC0b5LTsQw0-crE_rYrCRYVQuUW7eGHF5OUN1c8oPdazhOvEN2aSrjD1wU9GhVP642DoxQqwn4W_FH87BYcZ8Bkl1iX1onHGj3IuV8jM5MvdBmRvO-Uk3RaGzM_6PO1denGeJR7JCEF3kGyovcjK5-tmZoceNBfybStJQUtVOTwK2WqVvSFvwTM_lQyZQZbgqB7MXrk4sA6qnEpjsIoaXO-HAxBABR4HzMg0"
              }
              alt={featuredProduct?.name || "Ayurvedic Botanical Ingredients"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              unoptimized
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-secondary-container mb-1">
                Weekly Special
              </p>
              <h3 className="text-xl font-bold">
                {featuredProduct?.name || "Amrit Kalash Herbal Jam"}
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Order Tracker Section */}
      {session?.user && recentOrders.length > 0 && (
        <section className="bg-surface-container py-8 border-b border-soft-sage/10 font-sans">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-primary font-serif flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">track_changes</span>
                  Track Your Orders
                </h3>
                <p className="text-xs text-on-surface-variant font-medium mt-1">
                  Real-time status updates from our preparation facility.
                </p>
              </div>
              <Link
                href="/profile"
                className="text-xs font-bold text-secondary hover:text-primary flex items-center gap-1 self-start md:self-auto transition-colors"
              >
                Go to Order History
                <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentOrders.slice(0, 3).map((order) => {
                const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                
                // Determine step indices
                const statusSteps = ["pending", "processing", "shipped", "delivered"];
                const currentStepIndex = statusSteps.indexOf(order.shippingStatus || "pending");

                return (
                  <div
                    key={order._id}
                    className="bg-card-surface border border-soft-sage/15 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-[10px] font-mono text-cream-900/40 font-bold block">
                            ORDER ID: #{order._id.substring(0, 10)}...
                          </span>
                          <span className="text-[11px] font-semibold text-on-surface-variant block mt-0.5">
                            Placed on {orderDate}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <span
                            className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                              order.paymentStatus === "paid"
                                ? "bg-emerald-50 text-emerald-700"
                                : order.paymentStatus === "failed"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Shipping progress visualizer */}
                      <div className="my-4">
                        <div className="flex justify-between text-[9px] text-cream-900/60 font-bold uppercase tracking-wider mb-2">
                          <span className={currentStepIndex >= 0 ? "text-primary font-extrabold" : ""}>
                            Received
                          </span>
                          <span className={currentStepIndex >= 1 ? "text-primary font-extrabold" : ""}>
                            Preparing
                          </span>
                          <span className={currentStepIndex >= 2 ? "text-primary font-extrabold" : ""}>
                            Shipped
                          </span>
                          <span className={currentStepIndex >= 3 ? "text-primary font-extrabold" : ""}>
                            Delivered
                          </span>
                        </div>

                        {/* Progress Bar line */}
                        <div className="h-1.5 w-full bg-soft-sage/20 rounded-full overflow-hidden relative">
                          <div
                            className="h-full bg-secondary transition-all duration-500 rounded-full"
                            style={{
                              width: `${(currentStepIndex / 3) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-soft-sage/10 text-xs font-semibold mt-3">
                      <div className="flex items-center gap-1.5 text-primary">
                        <span className="material-symbols-outlined text-sm font-bold">
                          {order.shippingStatus === "delivered"
                            ? "check_circle"
                            : order.shippingStatus === "shipped"
                            ? "local_shipping"
                            : order.shippingStatus === "processing"
                            ? "precision_manufacturing"
                            : "schedule"}
                        </span>
                        <span className="capitalize font-bold text-[11px] tracking-wide">
                          {order.shippingStatus === "processing"
                            ? "Preparing specs"
                            : order.shippingStatus || "Pending"}
                        </span>
                      </div>
                      <span className="text-primary font-bold">
                        ₹{order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Main Catalog */}
      <section
        id="catalog"
        className="max-w-[1200px] w-full mx-auto px-4 md:px-8 py-16 flex-grow"
      >
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-3xl font-bold text-primary mb-3">
            Our Apothecary
          </h2>
          <p className="text-on-surface-variant font-serif">
            Select high-efficacy remedies designed to restore natural energy
            flows and address contemporary lifestyle concerns.
          </p>
        </div>

        {/* Filter Chips - Dynamic from DB */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
                cat === selectedCategory
                  ? "bg-secondary text-on-secondary border-secondary shadow-md scale-105"
                  : "bg-card-surface border-soft-sage/30 text-on-surface-variant hover:bg-soft-sage/10 hover:text-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-soft-sage mb-4 block">
              spa
            </span>
            <p className="font-semibold text-primary">
              No remedies found in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="product-card bg-card-surface rounded-xl overflow-hidden border border-soft-sage/20 group flex flex-col h-full hover:shadow-lg transition-all duration-300"
              >
                {/* Product Image */}
                <div className="aspect-square relative overflow-hidden bg-surface-container-low shrink-0">
                  <Image
                    src={
                      product.imageUrls[0] ||
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuB_YiAXZSxHX16NBtaR1knEsJ-5EDiMOvUWVG_Pm8E_nsEHxrUbfGTTjZAH3ZTQ1beCTxhnclnEujqLijfktAj4TCPD_zjK8B2iSJlJUnO7JKAq3x2HIvFeTOTLo1MHMdBdeXj78BKmtpav7kA0n_7aC42x19ZGbHFlmluQNDhEbxru3n0qkJhkXjcMlnrA4tb6SIDp0cC8pm25mrX8ag9_0AeNVw3GJ2SgTXVQzTxzsPob0VVhd1jktpTzc_4BPq2s3ara-_Q-uuQ"
                    }
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  {product.categories[0] && (
                    <span className="absolute top-4 left-4 bg-warm-ochre text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {product.categories[0]}
                    </span>
                  )}
                  {product.metadata?.size && (
                    <span className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                      {product.metadata.size}
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-primary group-hover:text-secondary transition-colors text-base line-clamp-1 mb-1.5">
                      {product.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-extrabold text-secondary">
                      ₹{product.price.toFixed(2)}
                    </span>

                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={product.stockQuantity <= 0}
                      className="p-2 bg-secondary-container/30 text-secondary hover:bg-secondary hover:text-on-secondary rounded-lg transition-all active:scale-90 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <span className="material-symbols-outlined text-lg">
                        add_shopping_cart
                      </span>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Trust & Guarantee Section */}
      <section className="bg-surface-container-low py-16 px-6 border-y border-soft-sage/10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-primary mb-3">
              Our Standards of Purity
            </h2>
            <p className="text-on-surface-variant font-serif text-sm">
              We verify and audit every botanical extraction stage to guarantee
              the highest safety and therapeutic activity levels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "verified",
                title: "Purity Certified",
                desc: "Every batch is audited for heavy metals and chemical residue levels.",
              },
              {
                icon: "eco",
                title: "100% Handcrafted",
                desc: "Made in small batches using traditional stone grinders and copper vessels.",
              },
              {
                icon: "psychology",
                title: "Vedic Provenance",
                desc: "Formulations are exactly matched to scriptures dating back 3,000 years.",
              },
              {
                icon: "clinical_suite",
                title: "Scientifically Proven",
                desc: "Clinically validated in collaboration with botanical researchers.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-card-surface rounded-xl p-6 border border-soft-sage/20 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-2xl">
                    {card.icon}
                  </span>
                </div>
                <h3 className="font-bold text-primary mb-2 text-sm">
                  {card.title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleStartCheckout}
      />

      {/* Real Razorpay Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-card-surface border border-soft-sage/20 rounded-2xl shadow-2xl overflow-hidden animate-scale-up font-sans">
            <div className="bg-primary text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-container">
                  spa
                </span>
                <div>
                  <h4 className="font-bold text-sm tracking-wide">
                    Razorpay Checkout
                  </h4>
                  <p className="text-[10px] text-soft-sage">
                    Pharmpill Biotech Secure Payment
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-soft-sage block uppercase font-bold tracking-wide">
                  Due
                </span>
                <span className="text-base font-bold">
                  ₹{checkoutTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <form onSubmit={handlePayWithRazorpay} className="p-5 space-y-4 text-xs font-semibold">
              <h5 className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">
                1. Delivery Shipping Address
              </h5>
              <div>
                <label className="text-cream-900/60 block mb-1">Street Address</label>
                <Input
                  required
                  disabled={isPaying}
                  value={shippingAddress.street}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, street: e.target.value })
                  }
                  placeholder="Flat/House No, Street name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-cream-900/60 block mb-1">City</label>
                  <Input
                    required
                    disabled={isPaying}
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="text-cream-900/60 block mb-1">State</label>
                  <Input
                    required
                    disabled={isPaying}
                    value={shippingAddress.state}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, state: e.target.value })
                    }
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-cream-900/60 block mb-1">Pin Code</label>
                  <Input
                    required
                    disabled={isPaying}
                    value={shippingAddress.zipCode}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, zipCode: e.target.value })
                    }
                    placeholder="Postal Code"
                  />
                </div>
                <div>
                  <label className="text-cream-900/60 block mb-1">Country</label>
                  <Input
                    required
                    disabled={isPaying}
                    value={shippingAddress.country}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, country: e.target.value })
                    }
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="saveProfileAddr"
                  disabled={isPaying}
                  checked={saveAddressToProfile}
                  onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                  className="rounded border-soft-sage text-secondary focus:ring-secondary cursor-pointer"
                />
                <label htmlFor="saveProfileAddr" className="text-cream-900/70 select-none cursor-pointer">
                  Save as default profile delivery address
                </label>
              </div>

              <div className="pt-4 border-t border-soft-sage/15 flex gap-3">
                <Button
                  type="button"
                  disabled={isPaying}
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="flex-1 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isPaying}
                  className="flex-1 bg-secondary hover:bg-primary font-bold"
                >
                  Pay ₹{checkoutTotal.toFixed(2)}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-primary text-on-primary/60 py-16 border-t border-secondary/20 font-serif">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <h4 className="font-bold text-white text-lg">Pharmpill Biotech</h4>
            <p className="text-xs leading-relaxed max-w-xs font-sans">
              Handcrafting wellness solutions since 2008. Dedicated to restoring
              body-mind balance through pure botanical preparations.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-white text-sm mb-4 uppercase tracking-wider font-sans">
              Quick Links
            </h5>
            <ul className="space-y-2 text-xs font-sans">
              <li>
                <Link
                  href="/"
                  className="hover:text-white transition-colors"
                >
                  Our Remedies
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white text-sm mb-4 uppercase tracking-wider font-sans">
              Categories
            </h5>
            <ul className="space-y-2 text-xs font-sans">
              {categories.slice(0, 4).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/#catalog`}
                    className="hover:text-white transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white text-sm mb-4 uppercase tracking-wider font-sans">
              Contact
            </h5>
            <ul className="space-y-2 text-xs font-sans">
              <li>Bengaluru Headquarters</li>
              <li>support@pharmpill.com</li>
              <li>+91 (80) 4928 0238</li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-8 border-t border-white/10 text-center text-xs font-sans">
          &copy; {new Date().getFullYear()} Pharmpill Biotech India Private
          Limited. All rights reserved.
        </div>
      </footer>
    </>
  );
}
