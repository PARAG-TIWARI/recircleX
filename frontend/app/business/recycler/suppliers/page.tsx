"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  MapPin,
  Star,
  Package,
  Phone,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RecyclerNav } from "@/components/recycler/recycler-nav";
import { Badge } from "@/components/ui/badge";
import { recyclerApi, SupplierItem } from "@/lib/api/recycler";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSuppliers() {
      try {
        const res = await recyclerApi.getSuppliers();
        setSuppliers(res);
      } catch (e) {
        console.error("Fetch suppliers error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSuppliers();
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
              Verified Collection Partners & Suppliers
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Direct network of certified regional scrap aggregation facilities and collection partners.
            </p>
          </div>

          <Link
            href="/business/recycler/marketplace"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 text-xs shadow-xs transition-colors"
          >
            <span>Browse Available Materials</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Suppliers Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading verified suppliers...</div>
        ) : suppliers.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
            No supplier profiles found.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((sup) => (
              <div
                key={sup.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    {sup.is_verified && (
                      <Badge variant="brand" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200">
                        Verified Partner
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{sup.name}</h3>
                    {sup.company_name && (
                      <p className="text-xs text-slate-500">{sup.company_name}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>Service Area: <strong>{sup.service_area}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span>Rating: <strong>{sup.rating}</strong> &bull; {sup.total_pickups} completed dispatches</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Materials Supplied:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {sup.materials_supplied.map((m) => (
                        <span
                          key={m}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-700"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <Link
                    href={`/business/recycler/marketplace?search=${encodeURIComponent(sup.name)}`}
                    className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 text-xs text-center transition-colors"
                  >
                    View Active Lots
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
