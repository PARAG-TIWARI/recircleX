"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Warehouse,
  Package,
  Layers,
  Calendar,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CollectorNav } from "@/components/collector/collector-nav";
import { Badge } from "@/components/ui/badge";
import { collectorApi, CollectorInventoryItem, CollectorInventoryList } from "@/lib/api/collector";

export default function CollectorInventoryPage() {
  const [inventoryData, setInventoryData] = useState<CollectorInventoryList>({
    items: [],
    total: 0,
    total_weight_kg: 0,
    total_estimated_value: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInventory() {
      try {
        const res = await collectorApi.getInventory(100, 0);
        setInventoryData(res);
      } catch (e) {
        console.error("Fetch inventory error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadInventory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-16 md:pb-0">
      <Navbar />
      <CollectorNav />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                <Warehouse className="h-3.5 w-3.5" />
                <span>Warehouse Aggregation Stock</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Collector Stock & Inventory
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                Materials weighed and collected during doorstep household pickups are automatically recorded here for warehouse batching and future B2B baling.
              </p>
            </div>

            <div className="flex gap-4 shrink-0">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Stock
                </span>
                <span className="text-2xl font-black text-emerald-700">
                  {inventoryData.total_weight_kg}{" "}
                  <span className="text-xs font-semibold text-slate-600">kg</span>
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Est. Wholesale
                </span>
                <span className="text-2xl font-black text-slate-900">
                  ₹{inventoryData.total_estimated_value}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Items List */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Collected Material Batches</h2>
              <p className="text-xs text-slate-500">Real-time inventory ledger synced upon pickup completion</p>
            </div>
            <span className="text-xs font-bold text-slate-600">
              {inventoryData.total} items in stock
            </span>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-xs text-slate-400">Loading warehouse inventory...</div>
          ) : inventoryData.items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Warehouse className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">No inventory batches recorded yet</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete household scrap pickups to automatically intake materials into this ledger.
                </p>
              </div>
              <Link
                href="/individual/collector/pickups"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 text-xs shadow-xs transition-colors"
              >
                View Available Pickups
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {inventoryData.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 hover:bg-white hover:border-emerald-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      {item.category}
                    </span>
                    <Badge
                      variant="neutral"
                      className={`text-[9px] py-0 px-2 font-bold ${
                        item.status === "AVAILABLE"
                          ? "bg-emerald-100 text-emerald-800 border-none"
                          : "bg-slate-200 text-slate-700 border-none"
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-snug">
                      {item.material}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Source: <strong>Household Collection</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Stock Weight:</span>
                      <p className="font-black text-slate-900">{item.quantity} {item.unit}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 text-[10px] block">Intake Value:</span>
                      <p className="font-black text-emerald-600">₹{item.estimated_value || 0}</p>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Quality: {item.quality}</span>
                    <span>Collected: {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
