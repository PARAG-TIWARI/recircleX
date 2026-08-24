"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Truck,
  CheckCircle2,
  Calendar,
  Layers,
  Scale,
  DollarSign,
  ArrowLeft,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CollectorNav } from "@/components/collector/collector-nav";
import { Badge } from "@/components/ui/badge";
import { collectorApi, CollectorPickupItem } from "@/lib/api/collector";

export default function CollectorOrdersPage() {
  const [orders, setOrders] = useState<CollectorPickupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await collectorApi.getPickups("completed", 100, 0);
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
      <CollectorNav />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Collection Intake History
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Verified digital scale weighing receipts and settled household collections.
            </p>
          </div>

          <Link
            href="/individual/collector/pickups"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 text-xs shadow-xs transition-colors"
          >
            <Truck className="h-4 w-4" />
            <span>Active Pickups</span>
          </Link>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading intake history...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ClipboardList className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No completed intakes</h3>
              <p className="text-xs text-slate-500 mt-1">
                Completed pickups will be archived here with timestamped weighing receipts.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100">
              {orders.map((item) => (
                <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                      <Scale className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{item.listing_title}</h4>
                        <Badge variant="brand" className="text-[9px] bg-emerald-100 text-emerald-800 border-none">
                          COLLECTED
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Receipt ID: <span className="font-mono">{item.id}</span> &bull; {item.location_area}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Actual Weight:</span>
                      <strong className="text-slate-900 font-black text-sm">{item.actual_weight || item.quantity} kg</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Payout Settled:</span>
                      <strong className="text-emerald-600 font-black text-sm">₹{item.final_amount || 180}</strong>
                    </div>
                    <Link
                      href={`/individual/collector/pickups/${item.id}`}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-100"
                    >
                      Receipt &rarr;
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
