import React from "react";
import { CheckCircle2, Package, Truck, Home, CreditCard } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export interface OrderItemData {
  product: string;
  name: string;
  priceAtPurchase: number;
  quantity: number;
}

export interface OrderTrackerProps {
  id: string;
  date: string;
  totalAmount: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentStatus: "pending" | "paid" | "failed";
  shippingStatus: "pending" | "processing" | "shipped" | "delivered";
  products: OrderItemData[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  id,
  date,
  totalAmount,
  razorpayOrderId,
  razorpayPaymentId,
  paymentStatus,
  shippingStatus,
  products,
  shippingAddress,
}) => {
  const steps = [
    { label: "Ordered", status: "pending", icon: Package },
    { label: "Processing", status: "processing", icon: CheckCircle2 },
    { label: "Shipped", status: "shipped", icon: Truck },
    { label: "Delivered", status: "delivered", icon: Home },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "pending": return 0;
      case "processing": return 1;
      case "shipped": return 2;
      case "delivered": return 3;
      default: return 0;
    }
  };

  const currentStepIndex = getStepIndex(shippingStatus);

  const getPaymentStatusVariant = (status: string) => {
    if (status === "paid") return "success";
    if (status === "failed") return "danger";
    return "warning";
  };

  return (
    <Card className="divide-y divide-cream-200/50">
      {/* Header Info */}
      <CardHeader className="flex sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-[10px] font-bold text-cream-900/40 uppercase tracking-wide">
            Order ID: {id}
          </span>
          <CardTitle className="text-base font-bold text-primary-dark mt-0.5">
            Placed on {date}
          </CardTitle>
        </div>
        <div className="flex gap-2">
          <Badge variant={getPaymentStatusVariant(paymentStatus)}>
            Payment: {paymentStatus}
          </Badge>
          <Badge variant="primary">
            Shipment: {shippingStatus}
          </Badge>
        </div>
      </CardHeader>

      {/* Shipping Status Progress Timeline */}
      <CardContent className="py-6">
        <div className="relative">
          {/* Progress Connector Line */}
          <div className="absolute top-5 left-6 right-6 h-0.5 bg-cream-200 -z-10 hidden sm:block">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(currentStepIndex / 3) * 100}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx <= currentStepIndex;
              const isActive = idx === currentStepIndex;

              return (
                <div
                  key={step.label}
                  className="flex sm:flex-col items-center gap-4 sm:gap-2 text-center"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      isCompleted
                        ? "bg-primary border-primary text-cream-50"
                        : "bg-white border-cream-300 text-cream-900/40"
                    } ${isActive ? "ring-4 ring-primary/15 scale-110" : ""}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        isCompleted ? "text-primary-dark" : "text-cream-900/40"
                      }`}
                    >
                      {step.label}
                    </p>
                    {isActive && (
                      <span className="text-[9px] font-semibold text-secondary uppercase tracking-wider block sm:mt-0.5">
                        Current Stage
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      {/* Order Products list & Details */}
      <CardContent className="py-5 flex flex-col md:flex-row gap-6 justify-between">
        {/* Products */}
        <div className="flex-1 flex flex-col gap-3">
          <h5 className="text-xs font-semibold text-cream-900/60 uppercase tracking-wider">
            Items Ordered
          </h5>
          <div className="flex flex-col gap-2">
            {products.map((item) => (
              <div key={item.product} className="flex justify-between items-center text-sm font-medium">
                <div className="text-cream-900">
                  {item.name}{" "}
                  <span className="text-xs text-cream-900/50">x{item.quantity}</span>
                </div>
                <div className="text-primary-dark font-bold">
                  ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-cream-100 pt-2 flex justify-between items-center text-sm font-bold mt-2">
            <span className="text-primary">Total Paid</span>
            <span className="text-base text-primary-dark">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Vertical Separator */}
        <div className="hidden md:block w-[1px] bg-cream-200" />

        {/* Shipping & Payment Specs */}
        <div className="w-full md:w-72 flex flex-col gap-4 text-xs">
          <div>
            <h5 className="font-semibold text-cream-900/60 uppercase tracking-wider mb-1.5">
              Shipping Address
            </h5>
            <p className="text-cream-900/80 leading-relaxed font-sans font-medium">
              {shippingAddress.street}, {shippingAddress.city}, <br />
              {shippingAddress.state} - {shippingAddress.zipCode}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <h5 className="font-semibold text-cream-900/60 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-primary-light" />
              Payment Records
            </h5>
            {razorpayOrderId && (
              <div className="flex justify-between">
                <span className="text-cream-900/50">Razorpay Order:</span>
                <code className="text-[10px] font-bold text-cream-900/80">{razorpayOrderId}</code>
              </div>
            )}
            {razorpayPaymentId && (
              <div className="flex justify-between">
                <span className="text-cream-900/50">Razorpay Payment:</span>
                <code className="text-[10px] font-bold text-cream-900/80">{razorpayPaymentId}</code>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
