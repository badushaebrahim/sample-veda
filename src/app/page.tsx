"use client";

import React, { useState } from "react";
import { 
  Leaf, 
  Sparkles, 
  ShoppingBag, 
  Settings, 
  Activity, 
  CreditCard, 
  CheckCircle, 
  User, 
  TrendingUp, 
  Plus, 
  Check, 
  AlertCircle
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { CartDrawer, CartItem } from "@/components/marketplace/CartDrawer";
import { OrderTracker } from "@/components/marketplace/OrderTracker";
import { InventoryTable } from "@/components/dashboard/InventoryTable";
import { OrderManager, DashboardOrder } from "@/components/dashboard/OrderManager";
import { AdminMetrics, TransactionRecord } from "@/components/dashboard/AdminMetrics";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// Initial Products Data
const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    name: "Karpoora Thulasi DX",
    description: "Authentic Ayurvedic cough & cold remedy enriched with Thulasi & Mulethi extracts for fast relief.",
    price: 18.50,
    stockQuantity: 422,
    categories: ["Respiratory", "Cough & Cold"],
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuB_YiAXZSxHX16NBtaR1knEsJ-5EDiMOvUWVG_Pm8E_nsEHxrUbfGTTjZAH3ZTQ1beCTxhnclnEujqLijfktAj4TCPD_zjK8B2iSJlJUnO7JKAq3x2HIvFeTOTLo1MHMdBdeXj78BKmtpav7kA0n_7aC42x19ZGbHFlmluQNDhEbxru3n0qkJhkXjcMlnrA4tb6SIDp0cC8pm25mrX8ag9_0AeNVw3GJ2SgTXVQzTxzsPob0VVhd1jktpTzc_4BPq2s3ara-_Q-uuQ"],
    metadata: {
      ingredients: ["Thulasi", "Mulethi", "Karpoora"],
      dosage: "Take 10ml thrice daily after meals",
      size: "200ml",
    },
  },
  {
    id: "prod-2",
    name: "Amrit Kalash Paste",
    description: "Synergistic blend of 53 herbs to strengthen natural defenses and boost vitality levels.",
    price: 42.00,
    stockQuantity: 24,
    categories: ["Immunity", "Daily Health"],
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDGF68ViWIxhJYciECVlPl8NYTz1yPpOemtk0I-e4kbC0b5LTsQw0-crE_rYrCRYVQuUW7eGHF5OUN1c8oPdazhOvEN2aSrjD1wU9GhVP642DoxQqwn4W_FH87BYcZ8Bkl1iX1onHGj3IuV8jM5MvdBmRvO-Uk3RaGzM_6PO1denGeJR7JCEF3kGyovcjK5-tmZoceNBfybStJQUtVOTwK2WqVvSFvwTM_lQyZQZbgqB7MXrk4sA6qnEpjsIoaXO-HAxBABR4HzMg0"],
    metadata: {
      ingredients: ["Amla", "Haritaki", "Sandalwood"],
      dosage: "Take 1 teaspoon twice daily with warm milk or water",
      size: "500g",
    },
  },
  {
    id: "prod-3",
    name: "Triphala Gold Tabs",
    description: "Ancient triple-fruit formula for gentle detoxification and optimal digestive health.",
    price: 24.00,
    stockQuantity: 15,
    categories: ["Digestive", "Detox"],
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBDxw6LP_r20Qy8bf9LYo5i7y_9W2GyknPmCyyoyLexb_ryiqSxCXB4UYIFFdKlS8URL4xHblJrKe8YST_J6zzXyc1ivqAsSGoenr_yHKJCDIgNZsCqAOD9_2VvuYKPfbVE_I7MdkAA_9_d_7ipbZchqqXN_EP47hGSvfwJ54kRl9zuTms013akoZkm7Mj2taOXK_37lD-JogNMRS0gcYvwJ8CXxsUu5rjHe4kRPIYS_I7HDcv3cD1hxIbIoEbbz2Jri9YHgYKOJ84"],
    metadata: {
      ingredients: ["Amalaki", "Bibhitaki", "Haritaki"],
      dosage: "1-2 tablets at bedtime with warm water",
      size: "60 Tablets",
    },
  },
  {
    id: "prod-4",
    name: "Ashwagandha Elixir",
    description: "Pure adaptogenic root extract to support healthy stress response and cognitive function.",
    price: 32.99,
    stockQuantity: 12,
    categories: ["Wellness", "Stress Relief"],
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuD2zVINomi8gxIGe77r8VmeXSRFTIRpt5IV32PvAr7NlcdOam8LG9L6Zws7NWLmu05RuzfMORLk-4Rzb3IExiRVSu-sFMVCYE7_joa5c3_GnrP9yUuRNophvl9Eq0-7Csewetim8ZC_1HusbyuGHdDX9KcE2bYZpr9AQWOPmVpOZ9oHdH2XdWvxGr_E_3BMjYUmKuSk4I59xPSBw63fvES7Zf2HYmkIWqL9aAKiggwcAo6YDlOqof4NKYQSL8bVk2f335ZQ_Poy73s"],
    metadata: {
      ingredients: ["Ashwagandha Root Extract"],
      dosage: "Take 15 drops in water twice daily",
      size: "100ml",
    },
  },
  {
    id: "prod-5",
    name: "Mahanarayan Oil",
    description: "Traditional warm massage oil with over 50 botanicals to support joint mobility and flexibility.",
    price: 21.50,
    stockQuantity: 88,
    categories: ["Joint Care", "Massage"],
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBT9wAkUeYu71a1yCHgSW9IZk_DPED9DLNxAafg33k0nVJX8guN0kxosGh4xuWGfLkZBULQ2eG-h8ZVwsV4Xe-fC3KDImKz18fb78GqnN_yEwpYKIY71mJ9quckaMhddbvF6a2IgEbmXNSbBecNwCkBWZRT6pctXvtSyq5BRcvQOfctIddQjPJrn4MAY3iVyXbuA12tFA4tCTRjJwl3RlLfvsVVO-PYGJPIafl98SerMljLB-MIuj_YyIgCvEc7s3PfEmrU-_qxybI"],
    metadata: {
      ingredients: ["Shatavari", "Ashwagandha", "Bala"],
      dosage: "Gently massage warm oil onto affected joints",
      size: "200ml",
    },
  },
  {
    id: "prod-6",
    name: "Liv-Right Detox",
    description: "Hepatoprotective blend containing Bhumyamalaki and Katuki to maintain healthy liver function.",
    price: 28.00,
    stockQuantity: 62,
    categories: ["Digestive", "Detox"],
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDuarS2O1wuE52VABp5ps_xzKjJiyLPkfbjbx6Uvt7xfotaWopTV35Y4b4Ew4kIxa_tfyBATCcrN9-puo3hC4vXTZKMWUSR6jwYTlwKPtSo6ffDuVcbs1tH62eMIb7sX_uygk7fRC0wPG4yl7nUwvDP3m0fNhIoO8KkbkCmZUmE5hZsO8AEh-JWaAol4AL9C3NBH_xaDHz5-J_KS0ITharMyr2U5iQkc632lfb8jcKpV7tsIDYAJEyY1M4DvAXUDn4bsUdplpyR8n0"],
    metadata: {
      ingredients: ["Bhumyamalaki", "Katuki", "Punarnava"],
      dosage: "1 capsule twice daily before meals",
      size: "60 Capsules",
    },
  },
  {
    id: "prod-7",
    name: "Nidra Deep Sleep",
    description: "Calming botanical tea blend designed to quiet the mind and promote restful, uninterrupted sleep.",
    price: 19.99,
    stockQuantity: 41,
    categories: ["Wellness", "Sleep Support"],
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuCydWVoMBf6KendSWgecRoLeISutS0BeMvgbSaMNvKMNP4lJ_Fmfv4mBQc2loG1UiJczOm57cqLYc4WFkw75ppUH0KZOJTk6aqypDJKJcJlXTN2F7efPtr7R4fgJr-3Ms3ZUYB0tmO7XhbtWnsl1s-IKa__TRtCCEBFDaBe37VLKUhY1pvS4SH5oy2HB0Zz4ewXSpKs3pYtO8ChBHQi2IHyTvUvIQoWtjz2DyDscq5HmtUB4JIsMVEQTL-Cjg1c1v1uTina9nHElZI"],
    metadata: {
      ingredients: ["Chamomile", "Brahmi", "Shankhpushpi"],
      dosage: "Steep 1 tea bag in hot water 30 mins before bedtime",
      size: "20 Tea Bags",
    },
  },
  {
    id: "prod-8",
    name: "Kumkumadi Glow",
    description: "Precious saffron-based facial oil for skin brightening, anti-aging, and a youthful complexion.",
    price: 55.00,
    stockQuantity: 18,
    categories: ["Skin Care", "Beauty"],
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuCiCSoWw2G9f1DvX2in9u7V2D9lDTAafsQ6UllC5Mx6wUMS0I3zGkOfs2TyYgfzOfzQzWmXCAND_wUXPs835SX2xVE9qSRJRj96iJnPCSiIzeqviBrLU6Spl2A43YDrN1ZatytxMOI4rSIwqXTbXOyGPvsMkJKDv2wir8bm5UElefYrqSGKkGvao6n5oiq7oqRqSE_jjdhtuOG-rKMgCYFhAQQd--JJE3OXM_5iuGESk-u9-SArnj0ohHjaM3_vq_DuvjblH3DVA0g"],
    metadata: {
      ingredients: ["Saffron", "Lotus Stems", "Sandalwood"],
      dosage: "Apply 3-4 drops to clean face at night",
      size: "30ml",
    },
  }
];

// Initial Mock Orders
const INITIAL_ORDERS: DashboardOrder[] = [
  {
    id: "AV-8921",
    customerName: "Elena Gilbert",
    customerEmail: "elena@example.com",
    products: [
      { product: "prod-2", name: "Amrit Kalash Paste", quantity: 1, priceAtPurchase: 42.00 }
    ],
    totalAmount: 42.00,
    razorpayOrderId: "order_K8dJ1s9d8Hsn1d",
    paymentStatus: "paid",
    shippingStatus: "delivered",
    createdAt: "2026-06-20 14:32",
  },
  {
    id: "AV-8922",
    customerName: "Julian Vane",
    customerEmail: "vane.j@example.com",
    products: [
      { product: "prod-4", name: "Ashwagandha Elixir", quantity: 2, priceAtPurchase: 32.99 },
      { product: "prod-3", name: "Triphala Gold Tabs", quantity: 1, priceAtPurchase: 24.00 }
    ],
    totalAmount: 89.98,
    razorpayOrderId: "order_L8s1mD9d3Nla2a",
    paymentStatus: "paid",
    shippingStatus: "processing",
    createdAt: "2026-06-23 10:15",
  },
  {
    id: "AV-8923",
    customerName: "Sofia Amaro",
    customerEmail: "amaros@example.com",
    products: [
      { product: "prod-8", name: "Kumkumadi Glow", quantity: 1, priceAtPurchase: 55.00 }
    ],
    totalAmount: 55.00,
    razorpayOrderId: "order_M2kLd8s2Js9dla",
    paymentStatus: "pending",
    shippingStatus: "pending",
    createdAt: "2026-06-23 22:30",
  }
];

export default function Home() {
  // Application Roles State Simulation
  const [activeRole, setActiveRole] = useState<"customer" | "factory" | "admin">("customer");
  
  // E-commerce States
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<DashboardOrder[]>(INITIAL_ORDERS);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [activeCheckoutOrderId, setActiveCheckoutOrderId] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [inspectOrder, setInspectOrder] = useState<DashboardOrder | null>(null);

  // Address Form (Checkout)
  const [shippingForm, setShippingForm] = useState({
    street: "12, Ayurvedic Hospital Lane, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    zipCode: "560038"
  });

  // Admin: Create Product Modal/Form State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    description: "",
    price: 0,
    stockQuantity: 10,
    categories: "General",
    size: "100g",
    ingredients: "",
    dosage: ""
  });

  // Handler functions
  const handleAddToCart = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product || product.stockQuantity <= 0) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === id
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

  // Checkout process simulation: Place Order -> Open Payment Modal (Razorpay)
  const handleStartCheckout = () => {
    if (cart.length === 0) return;

    // 1. Create a pending order in local state
    const orderId = `ord-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: DashboardOrder = {
      id: orderId,
      customerName: "Atreya Dev (Customer)",
      customerEmail: "atreya.dev@ayur.com",
      products: cart.map((item) => ({
        product: item.id,
        name: item.name,
        quantity: item.quantity,
        priceAtPurchase: item.price,
      })),
      totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      razorpayOrderId: `order_rzp_${Math.random().toString(36).substring(2, 12)}`,
      paymentStatus: "pending",
      shippingStatus: "pending",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveCheckoutOrderId(orderId);
    setCart([]);
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  // Simulating Razorpay payment completion (and Webhook transaction logic)
  const handleSimulatePayment = (success: boolean) => {
    if (!activeCheckoutOrderId) return;
    setIsPaying(true);

    setTimeout(() => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id === activeCheckoutOrderId) {
            const finalStatus = success ? "paid" : "failed";
            
            // Decement stock level atomically if payment was successful
            if (success) {
              setProducts((prevProducts) =>
                prevProducts.map((prod) => {
                  const purchasedItem = order.products.find((p) => p.product === prod.id);
                  if (purchasedItem) {
                    return {
                      ...prod,
                      stockQuantity: Math.max(0, prod.stockQuantity - purchasedItem.quantity),
                    };
                  }
                  return prod;
                })
              );
            }

            return {
              ...order,
              paymentStatus: finalStatus,
              razorpayOrderId: order.razorpayOrderId || `order_rzp_${Math.random().toString(36).substring(2, 12)}`,
              // Set a payment transaction ID from Razorpay Dashboard
              ...(success && { razorpayPaymentId: `pay_rzp_${Math.random().toString(36).substring(2, 12)}` })
            };
          }
          return order;
        })
      );
      setIsPaying(false);
      setIsCheckoutModalOpen(false);
      setActiveCheckoutOrderId(null);
    }, 1500);
  };

  // Factory/Admin stock update handler
  const handleUpdateStock = async (id: string, newStock: number) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stockQuantity: newStock } : p))
    );
  };

  // Factory/Admin order status handler
  const handleUpdateShippingStatus = async (id: string, status: any) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, shippingStatus: status } : o))
    );
  };

  // Admin CRUD: Create product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `prod-${products.length + 1}`;
    const newProd = {
      id: newId,
      name: newProductForm.name,
      description: newProductForm.description,
      price: Number(newProductForm.price) || 0,
      stockQuantity: Number(newProductForm.stockQuantity) || 0,
      categories: newProductForm.categories.split(",").map((c) => c.trim()),
      imageUrls: [],
      metadata: {
        ingredients: newProductForm.ingredients.split(",").map((i) => i.trim()),
        dosage: newProductForm.dosage,
        size: newProductForm.size,
      },
    };

    setProducts((prev) => [newProd, ...prev]);
    setShowAddProduct(false);
    setNewProductForm({
      name: "",
      description: "",
      price: 0,
      stockQuantity: 10,
      categories: "General",
      size: "100g",
      ingredients: "",
      dosage: ""
    });
  };

  // Map orders to Admin transaction records
  const transactionRecords: TransactionRecord[] = orders.map((o) => ({
    orderId: o.id,
    customerName: o.customerName,
    totalAmount: o.totalAmount,
    razorpayPaymentId: (o as any).razorpayPaymentId,
    paymentStatus: o.paymentStatus as any,
    createdAt: o.createdAt,
  }));

  // Retrieve current active order during checkout
  const currentCheckoutOrder = orders.find((o) => o.id === activeCheckoutOrderId);

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col font-sans">
      {/* Simulation Banner - Sticky Top */}
      <div className="bg-cream-900 text-cream-100 py-3 px-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-cream-900 z-50 sticky top-0 shadow-md">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gold animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Stitch Veda Sandbox: Role Switcher
          </span>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => setActiveRole("customer")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRole === "customer"
                ? "bg-primary text-cream-50 shadow-sm"
                : "bg-cream-900 text-cream-100/60 hover:text-cream-100"
            }`}
          >
            Normal Customer
          </button>
          <button
            onClick={() => setActiveRole("factory")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRole === "factory"
                ? "bg-primary text-cream-50 shadow-sm"
                : "bg-cream-900 text-cream-100/60 hover:text-cream-100"
            }`}
          >
            Factory User
          </button>
          <button
            onClick={() => setActiveRole("admin")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRole === "admin"
                ? "bg-primary text-cream-50 shadow-sm"
                : "bg-cream-900 text-cream-100/60 hover:text-cream-100"
            }`}
          >
            Administrator
          </button>
        </div>
      </div>

      {/* Main Responsive Navigation */}
      <Navbar
        userRole={activeRole}
        userName={activeRole === "customer" ? "Atreya Dev" : activeRole === "factory" ? "Factory Officer" : "Super Admin"}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
      />

      {/* Render Views based on Active User Role */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* CUSTOMER MARKETPLACE VIEW */}
        {activeRole === "customer" && (
          <div className="flex flex-col gap-10">
            {/* Hero Section */}
            <div className="relative rounded-2xl bg-gradient-to-br from-primary-dark via-primary to-primary-light text-cream-50 p-8 sm:p-12 overflow-hidden shadow-lg flex flex-col gap-4">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cream-50/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
              <div className="flex items-center gap-2 text-gold font-semibold uppercase tracking-wider text-xs">
                <Sparkles className="w-4 h-4 animate-bounce" />
                Purest Wellness Remedies
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold max-w-2xl leading-tight">
                Authentic Ayurveda, Tailored for Modern Balance.
              </h2>
              <p className="text-sm text-cream-100/80 max-w-xl font-sans leading-relaxed">
                Handcrafted formulations sourced directly from bio-diverse forests, structured using ancient vedic scripts, and verified for clinical purity.
              </p>
              <div className="flex flex-wrap gap-3 mt-2">
                <Badge variant="secondary" className="bg-secondary text-cream-50 px-3 py-1 text-xs border-none font-bold">
                  🌿 100% Organic
                </Badge>
                <Badge variant="secondary" className="bg-primary-light/40 text-cream-50 px-3 py-1 text-xs border-none font-bold">
                  🧪 Lab Tested
                </Badge>
                <Badge variant="secondary" className="bg-gold-light/20 text-gold-light px-3 py-1 text-xs border-none font-bold">
                  🛵 Fast Delivery
                </Badge>
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-2xl font-bold font-serif text-primary-dark flex items-center gap-2">
                  <Leaf className="w-6 h-6 text-primary animate-pulse" />
                  Ayurvedic Apothecary Products
                </h3>
                <p className="text-sm text-cream-900/50">
                  Select clean wellness supplements to balance your Kapha, Vata, and Pitta doshas.
                </p>
              </div>

              {/* Products list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    price={product.price}
                    stockQuantity={product.stockQuantity}
                    categories={product.categories}
                    imageUrls={product.imageUrls}
                    metadata={product.metadata}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </div>

            {/* My Account Order Logs */}
            <div className="border-t border-cream-200/80 pt-10 flex flex-col gap-6">
              <div>
                <h3 className="text-2xl font-bold font-serif text-primary-dark flex items-center gap-2">
                  <User className="w-6 h-6 text-primary" />
                  My Orders & Activity
                </h3>
                <p className="text-sm text-cream-900/50">
                  Track payment logs, invoice copies, and shipping tracking states.
                </p>
              </div>

              <div className="flex flex-col gap-6">
                {orders.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-xl border border-cream-200 text-cream-900/40 font-semibold">
                    You have not placed any orders yet.
                  </div>
                ) : (
                  orders.map((order) => (
                    <OrderTracker
                      key={order.id}
                      id={order.id}
                      date={order.createdAt}
                      totalAmount={order.totalAmount}
                      razorpayOrderId={order.razorpayOrderId}
                      razorpayPaymentId={(order as any).razorpayPaymentId}
                      paymentStatus={order.paymentStatus}
                      shippingStatus={order.shippingStatus}
                      products={order.products}
                      shippingAddress={shippingForm}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* FACTORY USER VIEW */}
        {activeRole === "factory" && (
          <div className="flex flex-col gap-10">
            {/* Inventory table */}
            <InventoryTable
              items={products}
              onUpdateStock={handleUpdateStock}
              isAdmin={false} // Factory users can only manage stock inline, not CRUD details
            />

            {/* Orders list */}
            <div className="border-t border-cream-200/80 pt-8">
              <OrderManager
                orders={orders}
                onUpdateShippingStatus={handleUpdateShippingStatus}
                onViewDetails={(order) => setInspectOrder(order)}
              />
            </div>
          </div>
        )}

        {/* ADMINISTRATOR VIEW */}
        {activeRole === "admin" && (
          <div className="flex flex-col gap-10">
            {/* Admin console action cards */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold font-serif text-primary-dark">Administrative Dashboard</h3>
                <p className="text-sm text-cream-900/50">Master control panel for product creations and financial auditing.</p>
              </div>
              <Button onClick={() => setShowAddProduct(true)} className="flex items-center gap-2 shadow-md">
                <Plus className="w-5 h-5" />
                Add New Product
              </Button>
            </div>

            {/* Create Product Form */}
            {showAddProduct && (
              <Card className="animate-fade-in border-2 border-primary/20">
                <CardHeader>
                  <CardTitle>Catalog Operations: Add Ayurvedic Product</CardTitle>
                  <CardDescription>
                    Provide high-res specifications. Product details will be published to the public catalog.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleCreateProduct}>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Product Name"
                      required
                      value={newProductForm.name}
                      onChange={(e) => setNewProductForm({...newProductForm, name: e.target.value})}
                      placeholder="e.g. Organic Triphala Powder"
                    />
                    <Input
                      label="Price (INR)"
                      type="number"
                      required
                      value={newProductForm.price || ""}
                      onChange={(e) => setNewProductForm({...newProductForm, price: parseFloat(e.target.value) || 0})}
                      placeholder="e.g. 299"
                    />
                    <Input
                      label="Stock Quantity"
                      type="number"
                      required
                      value={newProductForm.stockQuantity || ""}
                      onChange={(e) => setNewProductForm({...newProductForm, stockQuantity: parseInt(e.target.value) || 0})}
                      placeholder="e.g. 50"
                    />
                    <Input
                      label="Categories (comma separated)"
                      value={newProductForm.categories}
                      onChange={(e) => setNewProductForm({...newProductForm, categories: e.target.value})}
                      placeholder="e.g. Digestion, Detox, Capsules"
                    />
                    <Input
                      label="Ingredients (comma separated)"
                      value={newProductForm.ingredients}
                      onChange={(e) => setNewProductForm({...newProductForm, ingredients: e.target.value})}
                      placeholder="e.g. Amalaki, Haritaki"
                    />
                    <Input
                      label="Size/Volume"
                      value={newProductForm.size}
                      onChange={(e) => setNewProductForm({...newProductForm, size: e.target.value})}
                      placeholder="e.g. 100g, 60 Caps"
                    />
                    <div className="md:col-span-2">
                      <Input
                        label="Description"
                        required
                        value={newProductForm.description}
                        onChange={(e) => setNewProductForm({...newProductForm, description: e.target.value})}
                        placeholder="Detailed description of benefits and formulation preparation method..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label="Dosage / Directions"
                        value={newProductForm.dosage}
                        onChange={(e) => setNewProductForm({...newProductForm, dosage: e.target.value})}
                        placeholder="e.g. Take 1 capsule twice daily after meals"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-3 bg-cream-50/50">
                    <Button variant="ghost" onClick={() => setShowAddProduct(false)}>Cancel</Button>
                    <Button type="submit">Publish to Catalog</Button>
                  </CardFooter>
                </form>
              </Card>
            )}

            {/* Financial Metrics */}
            <AdminMetrics transactions={transactionRecords} />

            {/* Inventory table */}
            <InventoryTable
              items={products}
              onUpdateStock={handleUpdateStock}
              onEditProduct={(id) => {
                const prod = products.find(p => p.id === id);
                if (prod) alert(`Product specs:\nName: ${prod.name}\nIngredients: ${prod.metadata.ingredients?.join(", ")}`);
              }}
              isAdmin={true} // Admin has full edit capabilities enabled
            />

            {/* Orders list */}
            <div className="border-t border-cream-200/80 pt-8">
              <OrderManager
                orders={orders}
                onUpdateShippingStatus={handleUpdateShippingStatus}
                onViewDetails={(order) => setInspectOrder(order)}
              />
            </div>
          </div>
        )}

      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleStartCheckout}
      />

      {/* Razorpay Mock Checkout Modal */}
      {isCheckoutModalOpen && currentCheckoutOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cream-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-cream-200 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            
            {/* Razorpay Styled Header */}
            <div className="bg-indigo-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                  R
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-wide">Razorpay Checkout</h4>
                  <p className="text-[10px] text-indigo-200">Stitch Veda Merchant Account</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-indigo-300 block uppercase font-bold tracking-wide">Amount Due</span>
                <span className="text-base font-bold">${currentCheckoutOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Order Overview */}
            <div className="p-5 flex flex-col gap-4 font-sans text-sm">
              <div className="bg-cream-50 border border-cream-200 rounded-lg p-3.5 flex flex-col gap-2">
                <div className="flex justify-between font-bold text-xs text-cream-900/50 uppercase tracking-wider">
                  <span>Order Reference</span>
                  <span>{currentCheckoutOrder.id}</span>
                </div>
                <div className="h-[1px] bg-cream-200 my-1" />
                {currentCheckoutOrder.products.map((item) => (
                  <div key={item.product} className="flex justify-between text-xs font-semibold text-primary-dark">
                    <span>{item.name} x {item.quantity}</span>
                    <span>${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Address verification details */}
              <div className="text-xs text-cream-900/70">
                <span className="font-bold text-cream-900/40 uppercase tracking-wide block mb-1">Shipping details</span>
                <p className="bg-cream-100/30 p-2.5 rounded border border-cream-200/50 leading-relaxed font-medium">
                  {shippingForm.street}, {shippingForm.city}, {shippingForm.state} - {shippingForm.zipCode}
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 text-xs">
                <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Sandbox payment: Click below to simulate Razorpay payment credentials.</span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-4 bg-cream-50/50 border-t border-cream-100 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => handleSimulatePayment(false)}
                disabled={isPaying}
                className="flex-1 text-red-700 border-red-700/25 hover:bg-red-50"
              >
                Simulate Fail
              </Button>
              <Button
                onClick={() => handleSimulatePayment(true)}
                isLoading={isPaying}
                className="flex-1 bg-indigo-900 hover:bg-indigo-850"
              >
                Simulate Success
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Address details overlay (Factory / Admin check) */}
      {inspectOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cream-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-cream-200 rounded-2xl shadow-xl overflow-hidden animate-scale-up">
            <CardHeader className="bg-cream-50 border-b border-cream-100">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-bold">Inspect Order #{inspectOrder.id}</CardTitle>
                <Badge variant={inspectOrder.paymentStatus === 'paid' ? 'success' : 'warning'}>
                  {inspectOrder.paymentStatus}
                </Badge>
              </div>
              <CardDescription>Placed on {inspectOrder.createdAt}</CardDescription>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-4 text-sm">
              <div>
                <span className="text-[10px] font-bold text-cream-900/40 uppercase tracking-wide block mb-1">Customer Details</span>
                <div className="font-semibold text-primary-dark">{inspectOrder.customerName}</div>
                <div className="text-xs text-cream-900/60 font-medium">{inspectOrder.customerEmail}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-cream-900/40 uppercase tracking-wide block mb-1">Shipping Address</span>
                <p className="bg-cream-100/30 p-3 rounded border border-cream-200/50 leading-relaxed font-sans font-medium text-cream-900/80">
                  {shippingForm.street}, {shippingForm.city}, {shippingForm.state} - {shippingForm.zipCode}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-cream-900/40 uppercase tracking-wide block mb-1">Ordered Items</span>
                <div className="flex flex-col gap-1.5 mt-1.5">
                  {inspectOrder.products.map(p => (
                    <div key={p.product} className="flex justify-between text-xs">
                      <span className="font-medium text-cream-900">{p.name} x {p.quantity}</span>
                      <span className="font-bold text-primary-dark">${(p.priceAtPurchase * p.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-cream-50/50 border-t border-cream-100 flex justify-end">
              <Button size="sm" onClick={() => setInspectOrder(null)}>Close</Button>
            </CardFooter>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-cream-900 text-cream-100/65 py-8 border-t border-cream-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">
            Stitch Veda Ayurvedic Commerce System
          </p>
          <p className="text-[11px] max-w-md font-sans">
            Designed as a high-fidelity system blueprint. Fully responsive, mobile-first design, secure role scopes, Mongoose bindings, and Razorpay webhook integrations.
          </p>
          <div className="text-[10px] text-cream-100/40">
            &copy; 2026 Stitch Veda Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
