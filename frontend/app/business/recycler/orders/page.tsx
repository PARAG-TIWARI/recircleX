"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RecyclerNav } from "@/components/recycler/recycler-nav";
import { Badge } from "@/components/ui/badge";
import { ordersApi, OrderItem } from "@/lib/api/orders";

export default function RecyclerOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await ordersApi.getOrders(false);
        setOrders(res.items);
      } catch (e) {
        console.error("Fetch orders error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-16 md:pb-0">
      <Navbar />
      <RecyclerNav />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              B2B Procurement Orders
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Active material reservations, supplier batch contracts, and delivery receipts.
            </p>
          </div>

          <Link
            href="/business/recycler/marketplace"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 text-xs shadow-xs transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Browse Marketplace</span>
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading procurement orders...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Package className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No procurement orders yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Browse active scrap lots on the B2B marketplace to place your first material reservation.
              </p>
            </div>
            <Link
              href="/business/recycler/marketplace"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 text-xs shadow-xs transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{order.material}</h4>
                        <Badge
                          variant="neutral"
                          className={`text-[9px] py-0 px-2 font-bold ${
                            order.status === "CONFIRMED"
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
                      <p className="text-xs text-slate-500 mt-0.5">
                        Supplier: <strong>{order.seller_name}</strong> &bull; Order ID: <span className="font-mono">{order.id}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Quantity</span>
                      <strong className="text-slate-900 font-black text-sm">{order.quantity} {order.unit}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Contract</span>
                      <strong className="text-emerald-600 font-black text-sm">₹{order.total_amount}</strong>
                    </div>
                    <Link
                      href={`/business/recycler/orders/${order.id}`}
                      className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-3.5 py-2 font-bold text-slate-800 shadow-2xs transition-colors"
                    >
                      Track Order &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
