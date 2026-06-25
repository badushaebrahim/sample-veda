import React from "react";
import { DollarSign, ShoppingCart, Award, AlertCircle, FileText, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

export interface TransactionRecord {
  orderId: string;
  customerName: string;
  totalAmount: number;
  razorpayPaymentId?: string;
  paymentStatus: "paid" | "pending" | "failed";
  createdAt: string;
}

interface AdminMetricsProps {
  transactions: TransactionRecord[];
}

export const AdminMetrics: React.FC<AdminMetricsProps> = ({ transactions }) => {
  const paidTransactions = transactions.filter((t) => t.paymentStatus === "paid");
  
  // Metric Calculations
  const grossPayments = paidTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalOrdersCount = transactions.length;
  const paidOrdersCount = paidTransactions.length;
  const pendingOrdersCount = transactions.filter((t) => t.paymentStatus === "pending").length;
  const failedOrdersCount = transactions.filter((t) => t.paymentStatus === "failed").length;
  const averageOrderValue = paidOrdersCount > 0 ? grossPayments / paidOrdersCount : 0;

  const cardStats = [
    {
      title: "Gross Revenue",
      value: `₹${grossPayments.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: "Aggregated gross sales (Razorpay Webhook synced)",
      icon: DollarSign,
      iconColor: "text-emerald-700",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Avg Order Value",
      value: `₹${averageOrderValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: "Average revenue generated per paid order",
      icon: Award,
      iconColor: "text-gold",
      bgColor: "bg-amber-50",
    },
    {
      title: "Total Orders",
      value: totalOrdersCount.toString(),
      description: `${paidOrdersCount} Paid, ${pendingOrdersCount} Pending, ${failedOrdersCount} Failed`,
      icon: ShoppingCart,
      iconColor: "text-secondary",
      bgColor: "bg-rose-50",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-cream-900/50 uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold text-primary-dark mt-1 font-serif">
                    {stat.value}
                  </h3>
                  <p className="text-[10px] text-cream-900/40 mt-1 font-sans">
                    {stat.description}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bgColor} ${stat.iconColor} shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Transaction Logs */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h4 className="text-base font-bold text-primary-dark font-serif">
            Razorpay Transaction Logs
          </h4>
        </div>

        <TableContainer>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Timestamp</TableHeaderCell>
              <TableHeaderCell>Order Reference</TableHeaderCell>
              <TableHeaderCell>Customer</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
              <TableHeaderCell>Razorpay Payment ID</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-cream-900/40 font-semibold">
                  No transaction records found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.orderId}>
                  <TableCell className="text-xs">{tx.createdAt}</TableCell>
                  <TableCell className="font-semibold text-primary-dark text-xs">#{tx.orderId}</TableCell>
                  <TableCell>{tx.customerName}</TableCell>
                  <TableCell className="font-semibold text-primary-dark">₹{tx.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {tx.razorpayPaymentId ? (
                      <span className="font-semibold text-primary-light select-all">{tx.razorpayPaymentId}</span>
                    ) : (
                      <span className="text-cream-900/30">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tx.paymentStatus === "paid"
                          ? "success"
                          : tx.paymentStatus === "failed"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {tx.paymentStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </TableContainer>
      </div>
    </div>
  );
};
