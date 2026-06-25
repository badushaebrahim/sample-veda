import React, { useState } from "react";
import { DashboardOrder } from "./OrderManager";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Clock, User, Clipboard, MapPin, Truck, History } from "lucide-react";

interface OrderInspectModalProps {
  order: DashboardOrder;
  onClose: () => void;
  onOrderUpdated: (updatedOrder: DashboardOrder) => void;
}

export const OrderInspectModal: React.FC<OrderInspectModalProps> = ({
  order,
  onClose,
  onOrderUpdated,
}) => {
  const [shippingStatus, setShippingStatus] = useState(order.shippingStatus || "pending");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [carrier, setCarrier] = useState(order.carrier || "");
  const [customerNote, setCustomerNote] = useState(order.customerNote || "");
  const [adminNote, setAdminNote] = useState(order.adminNote || "");
  const [saving, setSaving] = useState(false);

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingStatus,
          trackingNumber,
          carrier,
          customerNote,
          adminNote,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        // Map the updated order back
        const updated: DashboardOrder = {
          ...order,
          trackingNumber: data.data.trackingNumber,
          carrier: data.data.carrier,
          customerNote: data.data.customerNote,
          adminNote: data.data.adminNote,
          shippingStatus: data.data.shippingStatus,
          statusHistory: data.data.statusHistory,
        };
        onOrderUpdated(updated);
        alert("Order tracking and notes updated successfully!");
      } else {
        alert("Failed to save changes: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Save details error:", err);
      alert("Error updating order notes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-card-surface border border-soft-sage/20 rounded-2xl shadow-2xl overflow-hidden animate-scale-up my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-primary text-white p-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Clipboard className="w-5 h-5 text-secondary-container" />
            <h4 className="font-bold text-base font-serif">Inspect Dispatch Order #{order.id}</h4>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
              Payment: {order.paymentStatus}
            </Badge>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
        </div>

        {/* Form and info content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Top section: Customer Details, Assembly & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-surface p-4 rounded-xl border border-soft-sage/10">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Customer Information
                </span>
                <div className="font-bold text-primary flex items-center gap-1.5 text-sm">
                  <User className="w-4 h-4 text-secondary" />
                  {order.customerName}
                </div>
                <div className="text-xs text-on-surface-variant mt-0.5 ml-5">{order.customerEmail}</div>
              </div>

              <div className="bg-surface p-4 rounded-xl border border-soft-sage/10">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Delivery Destination
                </span>
                <div className="flex items-start gap-1.5 text-xs text-on-surface-variant leading-relaxed">
                  <MapPin className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <div>
                    {order.shippingAddress?.street}<br />
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zipCode}<br />
                    {order.shippingAddress?.country || "India"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface p-4 rounded-xl border border-soft-sage/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                  Items for Assembly
                </span>
                <div className="flex flex-col gap-2">
                  {order.products.map((p) => (
                    <div key={p.product} className="flex justify-between text-xs font-semibold text-on-surface border-b border-soft-sage/5 pb-1">
                      <span>{p.name} <span className="text-on-surface-variant font-normal">x {p.quantity}</span></span>
                      <span>₹{(p.priceAtPurchase * p.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-soft-sage/10 pt-2 mt-4 flex justify-between items-center text-xs font-bold text-primary">
                <span>Total Amount:</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Middle section: Operator Notes & Tracking details form */}
          <form onSubmit={handleSaveDetails} className="bg-surface p-5 rounded-xl border border-soft-sage/15 space-y-4">
            <h5 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-secondary" /> Tracking Details & Dispatch Notes</span>
            </h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-primary uppercase tracking-wider">Execution Status</label>
                <select
                  value={shippingStatus}
                  onChange={(e) => setShippingStatus(e.target.value as any)}
                  className="w-full h-10 text-xs bg-surface border border-outline-variant rounded-lg px-2 outline-none text-primary font-bold focus:ring-1 focus:ring-secondary"
                >
                  <option value="pending">Pending Execution</option>
                  <option value="processing">Processing (Factory)</option>
                  <option value="shipped">Shipped (In Transit)</option>
                  <option value="delivered">Delivered Successfully</option>
                </select>
              </div>
              <Input
                label="Carrier Partner"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="e.g. DTDC Express"
              />
              <Input
                label="Tracking/LR Number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. DTDC123456789"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                  Customer Display Note
                </label>
                <textarea
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Notes visible to the customer on their profile tracking panel..."
                  className="w-full h-20 text-xs bg-surface-container-low border border-outline-variant rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-secondary font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                  Internal Factory/Admin Notes
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Confidential notes visible only to factory operators and admins..."
                  className="w-full h-20 text-xs bg-surface-container-low border border-outline-variant rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-secondary font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={saving} size="sm" className="flex items-center gap-2">
                {saving ? (
                  <span className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-sm">save</span>
                )}
                Save Tracking & Notes
              </Button>
            </div>
          </form>

          {/* Bottom section: Audit status update logs */}
          <div className="bg-surface p-5 rounded-xl border border-soft-sage/15 space-y-4">
            <h5 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-secondary" />
              Order Status Audit Log
            </h5>
            
            {order.statusHistory && order.statusHistory.length > 0 ? (
              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-soft-sage/20">
                {order.statusHistory.map((history, idx) => (
                  <div key={idx} className="flex gap-4 text-xs relative pl-8">
                    <div className="absolute left-[7px] top-1 w-2.5 h-2.5 rounded-full bg-secondary shrink-0" />
                    <div className="flex-grow bg-surface-container-low p-3 rounded-lg border border-soft-sage/10">
                      <div className="flex items-center justify-between font-bold">
                        <span className="capitalize text-primary text-xs">
                          {history.status}
                        </span>
                        <span className="text-[10px] text-on-surface-variant font-normal">
                          {new Date(history.timestamp).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="text-[10px] text-on-surface-variant mt-1">
                        Updated by: <span className="font-semibold text-primary">{history.updatedByName}</span> ({history.updatedByEmail})
                      </div>
                      {history.note && (
                        <p className="mt-2 text-xs text-on-surface bg-surface-container-high p-2 rounded border border-soft-sage/5 font-medium italic">
                          "{history.note}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-soft-sage/20">
                <div className="flex gap-4 text-xs relative pl-8">
                  <div className="absolute left-[7px] top-1 w-2.5 h-2.5 rounded-full bg-secondary shrink-0" />
                  <div className="flex-grow bg-surface-container-low p-3 rounded-lg border border-soft-sage/10">
                    <div className="flex items-center justify-between font-bold">
                      <span className="capitalize text-primary text-xs">
                        pending
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-normal">
                        {order.createdAt}
                      </span>
                    </div>
                    <div className="text-[10px] text-on-surface-variant mt-1">
                      Updated by: <span className="font-semibold text-primary">{order.customerName}</span> ({order.customerEmail})
                    </div>
                    <p className="mt-2 text-xs text-on-surface bg-surface-container-high p-2 rounded border border-soft-sage/5 font-medium italic">
                      "Order placed successfully. Pending facility confirmation."
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-surface px-6 py-4 flex justify-end shrink-0 border-t border-outline-variant/10">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Inspection
          </Button>
        </div>
      </div>
    </div>
  );
};
