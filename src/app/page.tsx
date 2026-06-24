"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { CartDrawer, CartItem } from "@/components/marketplace/CartDrawer";
import { PRODUCTS, Product } from "@/lib/products";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // State
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [activeCheckoutOrderId, setActiveCheckoutOrderId] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [checkoutTotal, setCheckoutTotal] = useState(0);

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

  // Fetch products from MongoDB
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const json = await res.json();
        if (json.success && json.data) {
          // Map MongoDB _id to id
          const mapped = json.data.map((p: any) => ({
            id: p._id,
            name: p.name,
            description: p.description,
            price: p.price,
            stockQuantity: p.stockQuantity,
            categories: p.categories,
            imageUrls: p.imageUrls,
            metadata: p.metadata || {},
          }));
          setDbProducts(mapped);
        } else {
          setDbProducts(PRODUCTS);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setDbProducts(PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Categories list
  const categories = ["All", "Respiratory", "Immunity", "Digestive", "Wellness", "Skin Care"];

  // Filtered Products
  const filteredProducts = selectedCategory === "All"
    ? dbProducts
    : dbProducts.filter(p => p.categories.includes(selectedCategory));


  // Handlers
  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page if clicked add-to-cart
    
    if (product.stockQuantity <= 0) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.stockQuantity, item.quantity + 1) }
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
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleStartCheckout = () => {
    if (cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCheckoutTotal(total);
    setActiveCheckoutOrderId(`ord-${Math.floor(1000 + Math.random() * 9000)}`);
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const handleSimulatePayment = (success: boolean) => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setIsCheckoutModalOpen(false);
      if (success) {
        setCart([]);
        alert("Payment simulated successfully! Your order has been placed.");
      } else {
        alert("Payment simulation failed. Please try again.");
      }
      setActiveCheckoutOrderId(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      {/* Dynamic Navbar with Cart Count and Callback */}
      <Navbar
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
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
              Discover pure botanical formulations, handcrafted from high-altitude wild herbs and tested for clinical efficacy to bring your doshas into perfect harmony.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="#catalog"
                className="px-6 py-3.5 bg-secondary text-on-secondary rounded-lg font-semibold hover:bg-primary shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
              >
                Shop Remedies
              </a>
              <button
                className="px-6 py-3.5 border border-soft-sage/30 text-secondary bg-white/50 backdrop-blur-xs rounded-lg font-semibold hover:bg-soft-sage/10 transition-all duration-300 active:scale-95"
              >
                Dosha Consultation
              </button>
            </div>
          </div>

          {/* Featured Hero Image */}
          <div className="relative aspect-video lg:aspect-square w-full rounded-2xl overflow-hidden shadow-xl border border-soft-sage/10 group">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGF68ViWIxhJYciECVlPl8NYTz1yPpOemtk0I-e4kbC0b5LTsQw0-crE_rYrCRYVQuUW7eGHF5OUN1c8oPdazhOvEN2aSrjD1wU9GhVP642DoxQqwn4W_FH87BYcZ8Bkl1iX1onHGj3IuV8jM5MvdBmRvO-Uk3RaGzM_6PO1denGeJR7JCEF3kGyovcjK5-tmZoceNBfybStJQUtVOTwK2WqVvSFvwTM_lQyZQZbgqB7MXrk4sA6qnEpjsIoaXO-HAxBABR4HzMg0"
              alt="Ayurvedic Botanical Ingredients"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              unoptimized
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-secondary-container mb-1">Weekly Special</p>
              <h3 className="text-xl font-bold">Amrit Kalash Herbal Jam</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog */}
      <section id="catalog" className="max-w-[1200px] w-full mx-auto px-4 md:px-8 py-16 flex-grow">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-3xl font-bold text-primary mb-3">Our Apothecary</h2>
          <p className="text-on-surface-variant font-serif">
            Select high-efficacy remedies designed to restore natural energy flows and address contemporary lifestyle concerns.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
                (cat === selectedCategory)
                  ? "bg-secondary text-on-secondary border-secondary shadow-md scale-105"
                  : "bg-card-surface border-soft-sage/30 text-on-surface-variant hover:bg-soft-sage/10 hover:text-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-3 border-secondary border-t-transparent rounded-full animate-spin" />
              <span className="text-on-surface-variant font-semibold text-sm">Harvesting remedies...</span>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-soft-sage mb-4 block">spa</span>
            <p className="font-semibold text-primary">No remedies found in this category.</p>
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
                    src={product.imageUrls[0] || "https://lh3.googleusercontent.com/aida-public/AB6AXuB_YiAXZSxHX16NBtaR1knEsJ-5EDiMOvUWVG_Pm8E_nsEHxrUbfGTTjZAH3ZTQ1beCTxhnclnEujqLijfktAj4TCPD_zjK8B2iSJlJUnO7JKAq3x2HIvFeTOTLo1MHMdBdeXj78BKmtpav7kA0n_7aC42x19ZGbHFlmluQNDhEbxru3n0qkJhkXjcMlnrA4tb6SIDp0cC8pm25mrX8ag9_0AeNVw3GJ2SgTXVQzTxzsPob0VVhd1jktpTzc_4BPq2s3ara-_Q-uuQ"}
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
                      ${product.price.toFixed(2)}
                    </span>
                    
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={product.stockQuantity <= 0}
                      className="p-2 bg-secondary-container/30 text-secondary hover:bg-secondary hover:text-on-secondary rounded-lg transition-all active:scale-90 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
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
            <h2 className="text-2xl font-bold text-primary mb-3">Our Standards of Purity</h2>
            <p className="text-on-surface-variant font-serif text-sm">
              We verify and audit every botanical extraction stage to guarantee the highest safety and therapeutic activity levels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "verified", title: "Purity Certified", desc: "Every batch is audited for heavy metals and chemical residue levels." },
              { icon: "eco", title: "100% Handcrafted", desc: "Made in small batches using traditional stone grinders and copper vessels." },
              { icon: "psychology", title: "Vedic Provenance", desc: "Formulations are exactly matched to scriptures dating back 3,000 years." },
              { icon: "clinical_suite", title: "Scientifically Proven", desc: "Clinically validated in collaboration with botanical researchers." },
            ].map((card) => (
              <div key={card.title} className="bg-card-surface rounded-xl p-6 border border-soft-sage/20 text-center">
                <div className="w-12 h-12 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-2xl">{card.icon}</span>
                </div>
                <h3 className="font-bold text-primary mb-2 text-sm">{card.title}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{card.desc}</p>
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

      {/* Mock Checkout Modal (Razorpay) */}
      {isCheckoutModalOpen && activeCheckoutOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-card-surface border border-soft-sage/20 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-primary text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-container">spa</span>
                <div>
                  <h4 className="font-bold text-sm tracking-wide">Razorpay Checkout</h4>
                  <p className="text-[10px] text-soft-sage">Pharmpill Biotech Sandbox</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-soft-sage block uppercase font-bold tracking-wide">Due</span>
                <span className="text-base font-bold">${checkoutTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-5 flex flex-col gap-4 text-sm">
              <div className="bg-surface-container-low border border-soft-sage/10 rounded-lg p-4">
                <div className="flex justify-between font-bold text-xs text-on-surface-variant uppercase tracking-wider">
                  <span>Order Ref</span>
                  <span>{activeCheckoutOrderId}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3.5 bg-secondary-container/20 border border-secondary-container/40 rounded-lg text-primary text-xs">
                <span className="material-symbols-outlined text-secondary text-lg">info</span>
                <span>This is a simulated Razorpay checkout environment. Click below to proceed.</span>
              </div>
            </div>

            <div className="px-5 py-4 bg-surface-container-low border-t border-outline-variant/30 flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleSimulatePayment(false)}
                disabled={isPaying}
                className="flex-1 border-error/30 text-error hover:bg-error/10"
              >
                Simulate Fail
              </Button>
              <Button
                onClick={() => handleSimulatePayment(true)}
                isLoading={isPaying}
                className="flex-1 bg-secondary hover:bg-primary"
              >
                Simulate Success
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-primary text-on-primary/60 py-16 border-t border-secondary/20 font-serif">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <h4 className="font-bold text-white text-lg">Pharmpill Biotech</h4>
            <p className="text-xs leading-relaxed max-w-xs font-sans">
              Handcrafting wellness solutions since 2008. Dedicated to restoring body-mind balance through pure botanical preparations.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-white text-sm mb-4 uppercase tracking-wider font-sans">Quick Links</h5>
            <ul className="space-y-2 text-xs font-sans">
              <li><Link href="/" className="hover:text-white transition-colors">Our Remedies</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Consultations</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Our Gardens</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white text-sm mb-4 uppercase tracking-wider font-sans">Categories</h5>
            <ul className="space-y-2 text-xs font-sans">
              <li><Link href="/" className="hover:text-white transition-colors">Digestive Wellness</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Respiratory Care</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Immunity & Vitality</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white text-sm mb-4 uppercase tracking-wider font-sans">Contact</h5>
            <ul className="space-y-2 text-xs font-sans">
              <li>Bengaluru Headquarters</li>
              <li>support@pharmpill.com</li>
              <li>+91 (80) 4928 0238</li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-8 border-t border-white/10 text-center text-xs font-sans">
          &copy; {new Date().getFullYear()} Pharmpill Biotech India Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
