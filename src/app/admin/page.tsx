"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { InventoryTable } from "@/components/dashboard/InventoryTable";
import { OrderManager, DashboardOrder } from "@/components/dashboard/OrderManager";
import { AdminMetrics, TransactionRecord } from "@/components/dashboard/AdminMetrics";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Authentication guards
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin");
    } else if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      if (role !== "admin") {
        router.push("/"); // Only admin can access /admin
      }
    }
  }, [status, session, router]);

  // Page States
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [updatingUserRoleIds, setUpdatingUserRoleIds] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Modals / Forms
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [inspectOrder, setInspectOrder] = useState<DashboardOrder | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form State for creating/editing product
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

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch Products
      const prodRes = await fetch("/api/products");
      const prodJson = await prodRes.json();
      if (prodJson.success && prodJson.data) {
        setProducts(prodJson.data.map((p: any) => ({
          ...p,
          id: p._id,
        })));
      }

      // Fetch Orders
      const orderRes = await fetch("/api/orders");
      const orderJson = await orderRes.json();
      if (orderJson.success && orderJson.data) {
        const orderData = orderJson.data;

        // Map to DashboardOrder
        const mappedOrders: DashboardOrder[] = orderData.map((o: any) => ({
          id: o._id,
          customerName: o.customer?.name || "OAuth User / Guest",
          customerEmail: o.customer?.email || "N/A",
          products: o.products || [],
          totalAmount: o.totalAmount || 0,
          razorpayOrderId: o.razorpayOrderId,
          paymentStatus: o.paymentStatus || "pending",
          shippingStatus: o.shippingStatus || "pending",
          createdAt: new Date(o.createdAt).toLocaleString("en-US"),
          shippingAddress: o.shippingAddress,
        }));
        setOrders(mappedOrders);

        // Map to TransactionRecord
        const mappedTransactions: TransactionRecord[] = orderData.map((o: any) => ({
          orderId: o._id,
          customerName: o.customer?.name || "Guest",
          totalAmount: o.totalAmount || 0,
          razorpayPaymentId: o.razorpayPaymentId,
          paymentStatus: o.paymentStatus || "pending",
          createdAt: new Date(o.createdAt).toLocaleString("en-US"),
        }));
        setTransactions(mappedTransactions);
      }

      // Fetch Users
      const userRes = await fetch("/api/users");
      const userJson = await userRes.json();
      if (userJson.success && userJson.data) {
        setUsers(userJson.data);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  // Handle image upload to public/uploads
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
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
        if (isEdit) {
          setEditingProduct((prev: any) => ({
            ...prev,
            imageUrls: [data.url],
          }));
        } else {
          setNewProductForm((prev) => ({ ...prev, imageUrl: data.url }));
          setImagePreview(data.url);
        }
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
        fetchData();
      } else {
        alert("Failed to create product: " + data.error);
      }
    } catch (err) {
      console.error("Error creating product:", err);
    }
  };

  // Edit product handler (opens modal)
  const handleEditClick = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setEditingProduct({
        ...prod,
        ingredientsRaw: prod.metadata?.ingredients?.join(", ") || "",
        categoriesRaw: prod.categories?.join(", ") || "",
      });
    }
  };

  // Save edited product specs
  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const payload = {
      name: editingProduct.name,
      description: editingProduct.description,
      price: parseFloat(editingProduct.price) || 0,
      stockQuantity: parseInt(editingProduct.stockQuantity) || 0,
      categories: editingProduct.categoriesRaw.split(",").map((c: any) => c.trim()),
      imageUrls: editingProduct.imageUrls || [],
      metadata: {
        ingredients: editingProduct.ingredientsRaw.split(",").map((i: any) => i.trim()),
        dosage: editingProduct.metadata?.dosage || "",
        size: editingProduct.metadata?.size || "",
      },
    };

    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        alert("Product updated successfully!");
        setEditingProduct(null);
        fetchData();
      } else {
        alert("Failed to update product: " + data.error);
      }
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };

  // Delete product handler
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this product from the database?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert("Product deleted successfully.");
        setEditingProduct(null);
        fetchData();
      } else {
        alert("Failed to delete product: " + data.error);
      }
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // Quick stock update handler
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
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, shippingStatus: newStatus as any } : o))
        );
      } else {
        alert("Failed to update shipping status: " + data.error);
      }
    } catch (err) {
      console.error("Error updating shipping status:", err);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    setUpdatingUserRoleIds((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        alert("Failed to update user role: " + data.error);
      }
    } catch (err) {
      console.error("Error updating user role:", err);
      alert("Error updating user role.");
    } finally {
      setUpdatingUserRoleIds((prev) => ({ ...prev, [userId]: false }));
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-secondary border-t-transparent rounded-full animate-spin" />
          <span className="text-on-surface-variant font-semibold text-sm">Accessing admin console...</span>
        </div>
      </div>
    );
  }

  const userName = session?.user?.name || "Administrator";

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-surface-container-low/80 backdrop-blur-md shadow-sm border-b border-soft-sage/10">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center px-4 md:px-8 py-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-3xl">admin_panel_settings</span>
            <span className="font-bold text-xl text-primary font-serif">Admin Dashboard</span>
            <Badge variant="danger" className="bg-red-50 text-red-700 border-none px-2.5 py-0.5 font-bold uppercase tracking-wider text-[10px]">
              Admin Role
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-on-surface-variant hidden md:inline">Console: {userName}</span>
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
            <h2 className="text-2xl font-bold text-primary font-serif">Ayurvedic Store Administration</h2>
            <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
              Track global metrics, execute full catalog updates, manage Razorpay payments, and dispatch orders.
            </p>
          </div>
          <button
            onClick={() => setShowAddProduct(true)}
            className="px-5 py-3 bg-secondary text-on-secondary hover:bg-primary font-semibold rounded-lg shadow transition-all active:scale-95 flex items-center gap-2 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Create Product Specs
          </button>
        </div>

        {/* Admin Overview & Transactions */}
        <div className="bg-card-surface border border-soft-sage/20 rounded-2xl p-6 md:p-8 shadow-sm">
          <AdminMetrics transactions={transactions} />
        </div>

        {/* Inventory Tracker & CRUD */}
        <div className="bg-card-surface border border-soft-sage/20 rounded-2xl p-6 md:p-8 shadow-sm">
          <InventoryTable
            items={products}
            onUpdateStock={handleUpdateStock}
            onEditProduct={handleEditClick}
            isAdmin={true}
          />
        </div>

        {/* Incoming Orders Manager */}
        <div className="bg-card-surface border border-soft-sage/20 rounded-2xl p-6 md:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">local_shipping</span>
            Fulfillment Queue
          </h3>
          <OrderManager
            orders={orders}
            onUpdateShippingStatus={handleUpdateShippingStatus}
            onViewDetails={(order) => setInspectOrder(order)}
          />
        </div>

        {/* User Account Controls & Role Elevation */}
        <div className="bg-card-surface border border-soft-sage/20 rounded-2xl p-6 md:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">manage_accounts</span>
            User Roles & Elevation Console
          </h3>
          <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
            By default, all registered users are created with the <strong>Customer</strong> role. Only administrators can elevate users to <strong>Factory Warehouse Operator</strong> or <strong>Administrator</strong>.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-soft-sage/20 text-left font-bold text-primary">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4">Date Joined</th>
                  <th className="py-3 px-4 text-right">Modify Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isUpdating = updatingUserRoleIds[u._id] || false;
                  return (
                    <tr key={u._id} className="border-b border-soft-sage/10 hover:bg-soft-sage/5 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-primary">{u.name}</td>
                      <td className="py-3.5 px-4 font-mono text-xs">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            u.role === "admin"
                              ? "danger"
                              : u.role === "factory"
                                ? "info"
                                : "default"
                          }
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-on-surface-variant">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isUpdating ? (
                          <span className="text-xs text-on-surface-variant/50 font-bold">Syncing...</span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                            className="text-xs bg-surface border border-outline-variant rounded-md px-2 py-1 focus:ring-1 focus:ring-secondary outline-none font-semibold text-primary"
                          >
                            <option value="customer">Customer</option>
                            <option value="factory">Factory</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant/50 font-semibold">
                      No user accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Product Modal */}
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
                      onChange={(e) => handleImageUpload(e, false)}
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

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-card-surface border border-soft-sage/20 rounded-2xl shadow-2xl overflow-hidden animate-scale-up my-8 max-h-[90vh] flex flex-col">
            <div className="bg-primary text-white p-5 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-lg font-serif">Edit Product Specs: {editingProduct.name}</h3>
              <button onClick={() => setEditingProduct(null)} className="text-white/80 hover:text-white">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="overflow-y-auto flex-1 p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Product Name"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
                <Input
                  label="Price (₹)"
                  type="number"
                  step="0.01"
                  required
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                />
                <Input
                  label="Stock Quantity"
                  type="number"
                  required
                  value={editingProduct.stockQuantity}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: e.target.value })}
                />
                <Input
                  label="Categories (comma separated)"
                  value={editingProduct.categoriesRaw}
                  onChange={(e) => setEditingProduct({ ...editingProduct, categoriesRaw: e.target.value })}
                />
                <Input
                  label="Ingredients (comma separated)"
                  value={editingProduct.ingredientsRaw}
                  onChange={(e) => setEditingProduct({ ...editingProduct, ingredientsRaw: e.target.value })}
                />
                <Input
                  label="Volume/Size"
                  value={editingProduct.metadata?.size || ""}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    metadata: { ...(editingProduct.metadata || {}), size: e.target.value }
                  })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary uppercase tracking-wider block">Description</label>
                <textarea
                  required
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-outline-variant rounded-lg focus:ring-1 focus:ring-secondary focus:border-secondary outline-none bg-surface"
                />
              </div>

              <Input
                label="Usage Dosage"
                value={editingProduct.metadata?.dosage || ""}
                onChange={(e) => setEditingProduct({
                  ...editingProduct,
                  metadata: { ...(editingProduct.metadata || {}), dosage: e.target.value }
                })}
              />

              {/* Edit Image Upload */}
              <div className="bg-surface-container-low border border-soft-sage/10 p-5 rounded-xl space-y-4">
                <label className="text-xs font-bold text-primary uppercase tracking-wider block">
                  Product Reference Image
                </label>
                <div className="flex items-center gap-5">
                  <label className="px-4 py-2.5 border border-dashed border-soft-sage/40 rounded-lg text-xs font-bold text-secondary cursor-pointer hover:bg-soft-sage/10 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">cloud_upload</span>
                    {uploading ? "Uploading..." : "Replace Image"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  {editingProduct.imageUrls?.[0] && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-soft-sage/20 bg-white">
                      <img src={editingProduct.imageUrls[0]} alt="Current" className="object-cover w-full h-full" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(editingProduct.id)}
                  className="px-4 py-2 bg-error/10 hover:bg-error/20 text-error font-bold rounded-lg text-sm transition-all"
                >
                  Delete Product
                </button>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setEditingProduct(null)}>Cancel</Button>
                  <Button type="submit" disabled={uploading}>Save Changes</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Order Details Modal */}
      {inspectOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card-surface border border-soft-sage/20 rounded-2xl shadow-xl overflow-hidden animate-scale-up">
            <div className="bg-primary text-white p-5 flex justify-between items-center">
              <h4 className="font-bold text-base font-serif">Inspect Dispatch Order #{inspectOrder.id}</h4>
              <Badge variant={inspectOrder.paymentStatus === 'paid' ? 'success' : 'warning'}>
                {inspectOrder.paymentStatus}
              </Badge>
            </div>
            <div className="p-5 flex flex-col gap-4 text-sm">
              <div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Customer Details</span>
                <div className="font-bold text-primary">{inspectOrder.customerName}</div>
                <div className="text-xs text-on-surface-variant">{inspectOrder.customerEmail}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Delivery Address</span>
                <p className="bg-surface-container-low p-3 rounded-lg border border-soft-sage/10 leading-relaxed text-xs">
                  {inspectOrder.shippingAddress?.street}, {inspectOrder.shippingAddress?.city}, {inspectOrder.shippingAddress?.state} - {inspectOrder.shippingAddress?.zipCode}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Items for Assembly</span>
                <div className="flex flex-col gap-1.5 mt-2">
                  {inspectOrder.products.map(p => (
                    <div key={p.product} className="flex justify-between text-xs font-semibold text-on-surface">
                      <span>{p.name} x {p.quantity}</span>
                      <span>${(p.priceAtPurchase * p.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low/50 border-t border-outline-variant/20 px-5 py-4 flex justify-end">
              <Button size="sm" onClick={() => setInspectOrder(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
