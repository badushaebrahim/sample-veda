import React, { useState } from "react";
import { Edit, Truck, Check, Eye, Package, Clock, Send, ShieldAlert } from "lucide-react";
import {
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";

export interface DashboardOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  products: {
    product: string;
    name: string;
    quantity: number;
    priceAtPurchase: number;
  }[];
  totalAmount: number;
  razorpayOrderId?: string;
  paymentStatus: "pending" | "paid" | "failed";
  shippingStatus: "pending" | "processing" | "shipped" | "delivered";
  createdAt: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  carrier?: string;
  customerNote?: string;
  adminNote?: string;
  statusHistory?: {
    status: "pending" | "processing" | "shipped" | "delivered";
    updatedBy: string;
    updatedByName: string;
    updatedByEmail: string;
    note?: string;
    trackingNumber?: string;
    carrier?: string;
    timestamp: string;
  }[];
}

interface OrderManagerProps {
  orders: DashboardOrder[];
  onUpdateShippingStatus: (id: string, status: "pending" | "processing" | "shipped" | "delivered") => Promise<void>;
  onViewDetails?: (order: DashboardOrder) => void;
}

export const OrderManager: React.FC<OrderManagerProps> = ({
  orders,
  onUpdateShippingStatus,
  onViewDetails,
}) => {


  const getShippingStatusVariant = (status: string) => {
    switch (status) {
      case "delivered": return "success";
      case "shipped": return "info";
      case "processing": return "warning";
      default: return "default";
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case "paid": return "success";
      case "failed": return "danger";
      default: return "warning";
    }
  };



  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-lg font-bold text-primary-dark">Incoming Orders Queue</h4>
        <p className="text-xs text-cream-900/50 mt-0.5">
          Process customer checkouts, monitor payments, and update shipping logs.
        </p>
      </div>

      <TableContainer>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Order Details</TableHeaderCell>
            <TableHeaderCell>Customer</TableHeaderCell>
            <TableHeaderCell>Items / Content</TableHeaderCell>
            <TableHeaderCell>Total Amount</TableHeaderCell>
            <TableHeaderCell>Payment Status</TableHeaderCell>
            <TableHeaderCell>Execution & Shipping Status</TableHeaderCell>
            <TableHeaderCell className="text-right">Inspect</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => {
            const itemsCount = order.products.reduce((acc, p) => acc + p.quantity, 0);

            return (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="font-semibold text-primary-dark text-xs truncate max-w-[120px]" title={order.id}>
                    #{order.id}
                  </div>
                  <div className="text-[10px] text-cream-900/40 mt-1 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {order.createdAt}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-cream-900">{order.customerName}</div>
                  <div className="text-xs text-cream-900/50 truncate max-w-[140px]" title={order.customerEmail}>
                    {order.customerEmail}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs max-w-[200px]">
                    <div className="font-bold text-primary-dark text-[11px] uppercase tracking-wide">
                      {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                    </div>
                    <div className="text-cream-900/60 truncate mt-0.5">
                      {order.products.map(p => `${p.name} (x${p.quantity})`).join(", ")}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-bold text-primary-dark">₹{order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>
                    {order.paymentStatus}
                  </Badge>
                  {order.razorpayOrderId && (
                    <div className="text-[9px] font-mono text-cream-900/40 mt-1 font-semibold">
                      rzp: {order.razorpayOrderId.substring(0, 12)}...
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 max-w-[200px]">
                    <Badge variant={getShippingStatusVariant(order.shippingStatus)} className="uppercase tracking-wider text-[10px]">
                      {order.shippingStatus}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(order)}
                      className="p-2 text-primary hover:text-secondary rounded-lg hover:bg-cream-100 transition-colors"
                      title="Inspect address and order specs"
                    >
                      <Eye className="w-4.5 h-4.5" />
                    </button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </TableContainer>
    </div>
  );
};
