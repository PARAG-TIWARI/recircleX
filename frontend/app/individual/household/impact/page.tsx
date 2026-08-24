"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Leaf,
  Sparkles,
  TreeDeciduous,
  Factory,
  Layers,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HouseholdNav } from "@/components/household/household-nav";
import { EcoBotFloating } from "@/components/household/ecobot-floating";
import { Badge } from "@/components/ui/badge";
import { impactApi, HouseholdImpactData } from "@/lib/api/impact";

export default function ImpactPage() {
  const [impact, setImpact] = useState<HouseholdImpactData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchImpact() {
      try {
        const data = await impactApi.getHouseholdImpact();
        setImpact(data);
      } catch (e) {
        console.error("Fetch impact error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchImpact();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-16 md:pb-0">
      <Navbar />
      <HouseholdNav />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                <Leaf className="h-3.5 w-3.5" />
                <span>Real-Time Sustainability Ledger</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Your Circular Environmental Impact
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                Every kilogram of segregated plastic, paper, and metal you recycle actively diverts municipal waste from open dumps and offsets industrial greenhouse gas emissions.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 shrink-0">
              <Award className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-slate-900">Green Citizen Tier</p>
                <p className="text-[11px] text-emerald-700 font-semibold">Eco-Champion Level 1</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Core Impact Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Recycled</span>
              <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Leaf className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {impact?.total_material_recycled_kg || 0}{" "}
              <span className="text-sm font-semibold text-slate-500">kg</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Directly recovered</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Completed Pickups</span>
              <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {impact?.total_pickups_completed || 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Verified doorstep intaking</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">CO₂ Offset</span>
              <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Factory className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">
              {impact?.estimated_co2_offset_kg || 0}{" "}
              <span className="text-sm font-semibold text-slate-500">kg CO₂e</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Estimated environmental impact</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Trees Equivalent</span>
              <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <TreeDeciduous className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {impact?.trees_equivalent || 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Annual tree carbon absorption</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Materials Recycled by Category</h2>
              <p className="text-xs text-slate-500">Breakdown of collected volume across polymer & commodity streams.</p>
            </div>
            <span className="text-xs font-bold text-emerald-700">
              *Estimated environmental impact based on secondary smelting and regranulation indices.
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {impact?.categories.map((cat, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{cat.category}</span>
                  <Badge variant="brand" className="text-[10px] bg-emerald-100 text-emerald-800 border-none">
                    {cat.percentage}%
                  </Badge>
                </div>
                <div className="text-xl font-black text-slate-900">
                  {cat.weight_kg} <span className="text-xs text-slate-500 font-semibold">kg</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.max(cat.percentage, 5)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  Saved approx <span className="font-bold text-emerald-700">{cat.co2_saved_kg} kg CO₂</span>
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Ready to boost your climate impact?</h4>
                <p className="text-[11px] text-slate-600">List another lot of household paper, cardboard, or plastic scrap today.</p>
              </div>
            </div>
            <Link
              href="/individual/household/create-listing"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 text-xs shadow-xs transition-colors whitespace-nowrap"
            >
              List Scrap Now &rarr;
            </Link>
          </div>
        </div>
      </main>

      <EcoBotFloating />
      <Footer />
    </div>
  );
}
