"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  MapPin,
  FileText,
  DollarSign,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RecyclerNav } from "@/components/recycler/recycler-nav";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { ordersApi, OrderItem } from "@/lib/api/orders";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await ordersApi.getOrderDetail(orderId);
      setOrder(res);
    } catch (e: any) {
      toast(e.message || "Failed to load order", "error");
    } finally {
      setIsLoading(false);
    }
  }, [orderId, toast]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const updated = await ordersApi.updateStatus(orderId, newStatus, `Order status updated to ${newStatus}`);
      setOrder(updated);
      toast(`Order status updated to ${newStatus}`, "success");
    } catch (e: any) {
      toast(e.message || "Failed to update order", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const getTimelineStage = (status: string) => {
    switch (status) {
      case "PENDING":
        return 0;
      case "CONFIRMED":
        return 1;
      case "PROCESSING":
        return 2;
      case "COMPLETED":
        return 3;
      default:
        return 1;
    }
  };

  const STAGES = [
    { title: "Order Created", desc: "Reservation submitted on B2B marketplace" },
    { title: "Seller Confirmation", desc: "Aggregator batch confirmed for dispatch" },
    { title: "Processing & Transport", desc: "Freight weighing and dispatch en route" },
    { title: "Material Received", desc: "Intake verified and settled at plant" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <RecyclerNav />
        <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
          Loading order details...
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <RecyclerNav />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
          <p className="text-sm font-bold text-slate-800">Order not found</p>
          <Link
            href="/business/recycler/orders"
            className="rounded-xl bg-emerald-600 text-white font-bold text-xs px-4 py-2"
          >
            Back to Orders
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const currentStage = getTimelineStage(order.status);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-16 md:pb-0">
      <Navbar />
      <RecyclerNav />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Back */}
        <Link
          href="/business/recycler/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Orders
        </Link>

        {/* Contract Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  {order.category}
                </span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-xs text-slate-500">
                  Contract Date: {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900">
                Order #{order.id}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Procured Material: <strong className="text-slate-900">{order.material}</strong> ({order.quality} Grade)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="neutral"
                className={`text-xs font-bold px-3 py-1 ${order.status === "CONFIRMED"
                    ? "bg-blue-100 text-blue-800 border-none"
                    : order.status === "PROCESSING"
                      ? "bg-amber-100 text-amber-800 border-none"
                      : order.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800 border-none"
                        : "bg-slate-200 text-slate-700 border-none"
                  }`}
              >
                {order.status}
              </Badge>
            </div>
          </div>

          {/* 4-Stage Timeline Progression */}
          <div className="py-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STAGES.map((stg, idx) => {
                const isCompleted = idx < currentStage;
                const isCurrent = idx === currentStage;
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all ${isCurrent
                        ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20"
                        : isCompleted
                          ? "bg-slate-50 border-slate-200"
                          : "bg-white border-slate-100 opacity-60"
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isCompleted || isCurrent
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 text-slate-600"
                          }`}
                      >
                        {isCompleted ? "✓" : idx + 1}
                      </div>
                      <span className="font-bold text-xs text-slate-900">{stg.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{stg.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contract Breakdown & Values */}
          <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 block text-[10px]">Contract Quantity:</span>
              <strong className="text-base font-black text-slate-900">{order.quantity} {order.unit}</strong>
              <p className="text-[10px] text-slate-500">Pre-inspected lot</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 block text-[10px]">Agreed Unit Price:</span>
              <strong className="text-base font-black text-slate-900">₹{order.unit_price} / {order.unit}</strong>
              <p className="text-[10px] text-slate-500">Fixed rate contract</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
              <span className="text-emerald-800 block text-[10px] font-bold uppercase">Total Contract Value:</span>
              <strong className="text-lg font-black text-emerald-700">₹{order.total_amount}</strong>
              <p className="text-[10px] text-slate-500">Settlement upon weighbridge</p>
            </div>
          </div>

          {/* Supplier Info & Actions */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Supplier: {order.seller_name}</h4>
                <p className="text-slate-500 mt-0.5">
                  Depot Area: {order.seller_service_area || "Metro Zone 1"}
                </p>
              </div>
            </div>

            {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
              <div className="flex gap-2">
                {order.status === "CONFIRMED" && (
                  <button
                    onClick={() => handleUpdateStatus("PROCESSING")}
                    disabled={isUpdating}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 text-xs shadow-xs transition-colors"
                  >
                    Mark in Transit
                  </button>
                )}
                <button
                  onClick={() => handleUpdateStatus("COMPLETED")}
                  disabled={isUpdating}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Mark Material Received & Completed</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
