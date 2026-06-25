"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { InventoryTable, InventoryItem } from "@/components/dashboard/InventoryTable";
import { OrderManager, DashboardOrder } from "@/components/dashboard/OrderManager";
import { OrderInspectModal } from "@/components/dashboard/OrderInspectModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export default function FactoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Authentication guards
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/factory");
    } else if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      if (role !== "factory" && role !== "admin") {
        router.push("/"); // Redirect regular customers to home
      }
    }
  }, [status, session, router]);

  // Page States
  // Products/Inventory State
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productStatus, setProductStatus] = useState("All"); // "All" | "instock" | "outofstock"
  const [productCursor, setProductCursor] = useState<string | null>(null);
  const [productHasNext, setProductHasNext] = useState(false);
  const [productLoading, setProductLoading] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("All"); // "All" | "pending" | "processing" | "shipped" | "delivered"
  const [orderCursor, setOrderCursor] = useState<string | null>(null);
  const [orderHasNext, setOrderHasNext] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [inspectOrder, setInspectOrder] = useState<DashboardOrder | null>(null);

  // Form State for creating new product
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "10",
    categories: "General",
    size: "100g",
    ingredients: "",
    dosage: "",
    imageUrl: "",
  });

  const fetchProducts = async (reset = false) => {
    try {
      setProductLoading(true);
      const limit = 5;
      const currentCursor = reset ? "" : (productCursor || "");
      
      let url = `/api/products?limit=${limit}`;
      if (productSearch) url += `&search=${encodeURIComponent(productSearch)}`;
      if (productStatus !== "All") url += `&status=${productStatus}`;
      if (currentCursor) url += `&cursor=${currentCursor}`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        const mappedProducts = json.data.map((p: any) => ({
          ...p,
          id: p._id,
        }));
        
        if (reset) {
          setProducts(mappedProducts);
        } else {
          setProducts((prev) => [...prev, ...mappedProducts]);
        }
        
        setProductCursor(json.nextCursor || null);
        setProductHasNext(json.hasNextPage || false);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setProductLoading(false);
      setLoading(false);
    }
  };

  const fetchOrders = async (reset = false) => {
    try {
      setOrderLoading(true);
      const limit = 5;
      const currentCursor = reset ? "" : (orderCursor || "");
      
      let url = `/api/orders?limit=${limit}`;
      if (orderSearch) url += `&search=${encodeURIComponent(orderSearch)}`;
      if (orderStatus !== "All") url += `&shippingStatus=${orderStatus}`;
      if (currentCursor) url += `&cursor=${currentCursor}`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        const mappedOrders: DashboardOrder[] = json.data.map((o: any) => ({
          id: o._id,
          customerName: o.customer?.name || "OAuth User / Guest",
          customerEmail: o.customer?.email || "N/A",
          products: o.products || [],
          totalAmount: o.totalAmount || 0,
          razorpayOrderId: o.razorpayOrderId,
          paymentStatus: o.paymentStatus || "pending",
          shippingStatus: o.shippingStatus || "pending",
          createdAt: new Date(o.createdAt).toLocaleString("en-IN"),
          shippingAddress: o.shippingAddress,
          trackingNumber: o.trackingNumber,
          carrier: o.carrier,
          customerNote: o.customerNote,
          adminNote: o.adminNote,
          statusHistory: o.statusHistory,
        }));
        
        if (reset) {
          setOrders(mappedOrders);
        } else {
          setOrders((prev) => [...prev, ...mappedOrders]);
        }
        
        setOrderCursor(json.nextCursor || null);
        setOrderHasNext(json.hasNextPage || false);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setOrderLoading(false);
      setLoading(false);
    }
  };

  // Trigger products fetch when search or filter changes
  useEffect(() => {
    if (status === "authenticated") {
      fetchProducts(true);
    }
  }, [status, productSearch, productStatus]);

  // Trigger orders fetch when search or filter changes
  useEffect(() => {
    if (status === "authenticated") {
      fetchOrders(true);
    }
  }, [status, orderSearch, orderStatus]);

  // Handle image upload to public/uploads
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setNewProductForm((prev) => ({ ...prev, imageUrl: data.url }));
        setImagePreview(data.url);
      } else {
        alert("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading file. Make sure you are logged in.");
    } finally {
      setUploading(false);
    }
  };

  // Create Product handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: newProductForm.name,
      description: newProductForm.description,
      price: parseFloat(newProductForm.price) || 0,
      stockQuantity: parseInt(newProductForm.stockQuantity) || 0,
      categories: newProductForm.categories.split(",").map((c) => c.trim()),
      imageUrls: newProductForm.imageUrl ? [newProductForm.imageUrl] : [],
      metadata: {
        ingredients: newProductForm.ingredients.split(",").map((i) => i.trim()),
        dosage: newProductForm.dosage,
        size: newProductForm.size,
      },
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        alert("Product published successfully!");
        setShowAddProduct(false);
        setImagePreview(null);
        setNewProductForm({
          name: "",
          description: "",
          price: "",
          stockQuantity: "10",
          categories: "General",
          size: "100g",
          ingredients: "",
          dosage: "",
          imageUrl: "",
        });
        fetchProducts(true); // Refresh products list
      } else {
        alert("Failed to create product: " + data.error);
      }
    } catch (err) {
      console.error("Error creating product:", err);
      alert("Failed to publish product.");
    }
  };

  // Update stock handler
  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockQuantity: newStock }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, stockQuantity: newStock } : p))
        );
      } else {
        alert("Failed to update stock: " + data.error);
      }
    } catch (err) {
      console.error("Error updating stock:", err);
    }
  };

  // Update shipping status handler
  const handleUpdateShippingStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? {
            ...o,
            shippingStatus: data.data.shippingStatus,
            statusHistory: data.data.statusHistory,
          } : o))
        );
      } else {
        alert("Failed to update status: " + data.error);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-secondary border-t-transparent rounded-full animate-spin" />
          <span className="text-on-surface-variant font-semibold text-sm">Accessing warehouse console...</span>
        </div>
      </div>
    );
  }

  const userName = session?.user?.name || "Factory Officer";

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-surface-container-low/80 backdrop-blur-md shadow-sm border-b border-soft-sage/10">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center px-4 md:px-8 py-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-3xl">precision_manufacturing</span>
            <span className="font-bold text-xl text-primary font-serif">Warehouse Terminal</span>
            <Badge variant="primary" className="bg-secondary-container text-on-secondary-container border-none px-2.5 py-0.5 font-bold uppercase tracking-wider text-[10px]">
              Factory Role
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-on-surface-variant hidden md:inline">Logged in as: {userName}</span>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="px-3.5 py-2 border border-error/20 text-error hover:bg-error-container/20 rounded-lg text-xs font-bold transition-all">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1200px] w-full mx-auto px-4 md:px-8 py-10 flex-grow space-y-12">
        {/* Header Action Card */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card-surface border border-soft-sage/20 rounded-2xl p-6 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-primary font-serif">Catalog & Inventory Management</h2>
            <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
              Verify real-time stock levels, upload botanical reference images, and track incoming shipping queue.
            </p>
          </div>
          <button
            onClick={() => setShowAddProduct(true)}
            className="px-5 py-3 bg-secondary text-on-secondary hover:bg-primary font-semibold rounded-lg shadow transition-all active:scale-95 flex items-center gap-2 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add Product Specs
          </button>
        </div>

        {/* Add Product Modal Form */}
        {showAddProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-2xl bg-card-surface border border-soft-sage/20 rounded-2xl shadow-2xl overflow-hidden animate-scale-up my-8 max-h-[90vh] flex flex-col">
              <div className="bg-primary text-white p-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary-container">spa</span>
                  <h3 className="font-bold text-lg font-serif">Publish New Product Specs</h3>
                </div>
                <button onClick={() => setShowAddProduct(false)} className="text-white/80 hover:text-white">
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="overflow-y-auto flex-1 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label="Product Name"
                    required
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                    placeholder="e.g. Karpoora Thulasi DX"
                  />
                  <Input
                    label="Price (₹)"
                    type="number"
                    step="0.01"
                    required
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                    placeholder="e.g. 18.50"
                  />
                  <Input
                    label="Initial Stock Quantity"
                    type="number"
                    required
                    value={newProductForm.stockQuantity}
                    onChange={(e) => setNewProductForm({ ...newProductForm, stockQuantity: e.target.value })}
                    placeholder="e.g. 100"
                  />
                  <Input
                    label="Categories (comma separated)"
                    value={newProductForm.categories}
                    onChange={(e) => setNewProductForm({ ...newProductForm, categories: e.target.value })}
                    placeholder="e.g. Respiratory, Cough & Cold"
                  />
                  <Input
                    label="Ingredients (comma separated)"
                    value={newProductForm.ingredients}
                    onChange={(e) => setNewProductForm({ ...newProductForm, ingredients: e.target.value })}
                    placeholder="e.g. Thulasi, Mulethi, Karpoora"
                  />
                  <Input
                    label="Volume/Size"
                    value={newProductForm.size}
                    onChange={(e) => setNewProductForm({ ...newProductForm, size: e.target.value })}
                    placeholder="e.g. 200ml, 500g"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider block">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={newProductForm.description}
                    onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-outline-variant rounded-lg focus:ring-1 focus:ring-secondary focus:border-secondary outline-none placeholder:text-on-surface-variant/40 bg-surface"
                    placeholder="Provide details of remedy preparation and indications..."
                  />
                </div>

                <Input
                  label="Usage Dosage"
                  value={newProductForm.dosage}
                  onChange={(e) => setNewProductForm({ ...newProductForm, dosage: e.target.value })}
                  placeholder="e.g. Take 10ml thrice daily after meals"
                />

                {/* Botanical Reference Image Upload */}
                <div className="bg-surface-container-low border border-soft-sage/10 p-5 rounded-xl space-y-4">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider block">
                    Product Reference Image
                  </label>

                  <div className="flex items-center gap-5">
                    <label className="px-4 py-2.5 border border-dashed border-soft-sage/40 rounded-lg text-xs font-bold text-secondary cursor-pointer hover:bg-soft-sage/10 transition-all flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">cloud_upload</span>
                      {uploading ? "Uploading..." : "Choose File"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>

                    {imagePreview && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-soft-sage/20 bg-white">
                        <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
                  <Button variant="ghost" onClick={() => setShowAddProduct(false)}>Cancel</Button>
                  <Button type="submit" disabled={uploading}>Publish Product</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Physical Inventory Tracker */}
        <div className="bg-card-surface border border-soft-sage/20 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">inventory_2</span>
                Physical Inventory Tracker
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Monitor and adjust stock quantities of remedies in real-time.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex-1 md:w-72">
                <Input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by name..."
                  className="h-10 text-sm"
                />
              </div>
              <select
                value={productStatus}
                onChange={(e) => setProductStatus(e.target.value)}
                className="h-10 text-sm bg-surface border border-outline-variant rounded-lg px-3 outline-none text-primary font-semibold"
              >
                <option value="All">All Stocks</option>
                <option value="instock">In Stock</option>
                <option value="outofstock">Out of Stock</option>
              </select>
            </div>
          </div>

          <InventoryTable
            items={products}
            onUpdateStock={handleUpdateStock}
            isAdmin={true} // Allow factory to view detail edit buttons or update stock
          />

          {productHasNext && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => fetchProducts(false)}
                disabled={productLoading}
                className="flex items-center gap-2 text-xs py-2 px-4"
              >
                {productLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                )}
                Load More Products
              </Button>
            </div>
          )}
        </div>

        {/* Incoming Orders Manager */}
        <div className="bg-card-surface border border-soft-sage/20 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">local_shipping</span>
                Factory Dispatch Log
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Process customer checkouts and update packaging/shipping logs.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex-1 md:w-72">
                <Input
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search orders..."
                  className="h-10 text-sm"
                />
              </div>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="h-10 text-sm bg-surface border border-outline-variant rounded-lg px-3 outline-none text-primary font-semibold"
              >
                <option value="All">All Statuses</option>
                <option value="pending">Pending Execution</option>
                <option value="processing">Processing (Factory)</option>
                <option value="shipped">Shipped (In Transit)</option>
                <option value="delivered">Delivered Successfully</option>
              </select>
            </div>
          </div>

          <OrderManager
            orders={orders}
            onUpdateShippingStatus={handleUpdateShippingStatus}
            onViewDetails={(order) => setInspectOrder(order)}
          />

          {orderHasNext && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => fetchOrders(false)}
                disabled={orderLoading}
                className="flex items-center gap-2 text-xs py-2 px-4"
              >
                {orderLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                )}
                Load More Orders
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Inspect Order Details Modal */}
      {inspectOrder && (
        <OrderInspectModal
          order={inspectOrder}
          onClose={() => setInspectOrder(null)}
          onOrderUpdated={(updated) => {
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
            setInspectOrder(updated);
          }}
        />
      )}
    </div>
  );
}
