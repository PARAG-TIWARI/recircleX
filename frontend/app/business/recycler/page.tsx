"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  ShoppingBag,
  Package,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Building2,
  Leaf,
  Layers,
  Clock,
  ChevronRight,
  Scale,
  DollarSign,
  Factory,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RecyclerNav } from "@/components/recycler/recycler-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { recyclerApi, RecyclerDashboardStats } from "@/lib/api/recycler";
import { marketplaceApi, MarketplaceListingItem } from "@/lib/api/marketplace";
import { ordersApi, OrderItem } from "@/lib/api/orders";

export default function RecyclerDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState<RecyclerDashboardStats | null>(null);
  const [featuredListings, setFeaturedListings] = useState<MarketplaceListingItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, marketRes, ordersRes] = await Promise.allSettled([
          recyclerApi.getDashboard(),
          marketplaceApi.getListings({ limit: 6, status_filter: "ACTIVE" }),
          ordersApi.getOrders(false),
        ]);
        if (statsRes.status === "fulfilled") setStats(statsRes.value);
        if (marketRes.status === "fulfilled") setFeaturedListings(marketRes.value.items);
        if (ordersRes.status === "fulfilled") setActiveOrders(ordersRes.value.items);
      } catch (e) {
        console.error("Recycler dashboard fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const companyName =
    user?.organizationMemberships?.[0]?.organization?.name ||
    user?.fullName ||
    "Recycling Mill Operations";

  return (
    <div className="min-h-screen bg-[#F5F7F9] text-slate-900 flex flex-col justify-between">
      <Navbar />
      <RecyclerNav />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: "Recycler Procurement" },
            { label: "Dashboard" },
          ]}
          title={`Procurement Center — ${companyName}`}
          description="Source certified secondary raw materials, issue purchase orders, monitor transit manifests, and track avoided Scope-3 emissions."
          action={
            <Link href="/business/recycler/marketplace">
              <Button variant="primary" size="default" leftIcon={<ShoppingBag className="h-4 w-4" />}>
                Browse B2B Catalog
              </Button>
            </Link>
          }
        />

        {/* Operational KPI Metric Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Available Supply Lots
                </span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">
                  {stats?.available_marketplace_lots_count ?? 0} <span className="text-xs font-normal text-slate-500">lots</span>
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Active Procurement Orders
                </span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">
                  {stats?.active_orders_count ?? 0}
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Package className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Total Feedstock Sourced
                </span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">
                  {(stats?.total_purchased_kg || 0).toFixed(1)} <span className="text-xs font-normal text-slate-500">kg</span>
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Scale className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Scope-3 CO₂ Offset
                </span>
                <span className="text-xl font-bold text-teal-800 mt-1 block">
                  {(stats?.estimated_co2_offset_kg || 0).toFixed(1)} <span className="text-xs font-normal text-slate-500">kg</span>
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
                <Leaf className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Two-Column Grid: Active Orders Table & Fast Marketplace Catalog */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Active Procurement Orders Table (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Active Purchase Orders ({activeOrders.length})
              </h2>
              <Link
                href="/business/recycler/orders"
                className="text-xs font-semibold text-[#0F766E] hover:underline"
              >
                View all orders &rarr;
              </Link>
            </div>

            {activeOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-xs text-slate-400">
                  No active procurement orders. Reserve material from the B2B catalog to initiate delivery.
                </CardContent>
              </Card>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeOrders.slice(0, 5).map((ord) => (
                    <TableRow key={ord.id}>
                      <TableCell className="font-mono font-bold text-slate-700">
                        <Link
                          href={`/business/recycler/orders/${ord.id}`}
                          className="hover:underline text-[#0F766E]"
                        >
                          #{ord.id.slice(-6).toUpperCase()}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {ord.material} ({ord.quality})
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {ord.quantity} {ord.unit}
                      </TableCell>
                      <TableCell className="font-bold text-slate-900">
                        ₹{ord.total_amount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={ord.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Right: Featured B2B Marketplace Supply (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Live Feedstock Supply ({featuredListings.length})
              </h2>
              <Link
                href="/business/recycler/marketplace"
                className="text-xs font-semibold text-[#0F766E] hover:underline"
              >
                Browse all &rarr;
              </Link>
            </div>

            {featuredListings.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-xs text-slate-400">
                  No active listings available right now.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {featuredListings.slice(0, 4).map((lot) => (
                  <div
                    key={lot.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="info">{lot.category}</Badge>
                        <span className="font-bold text-xs text-slate-900 truncate">{lot.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {lot.quantity} {lot.unit} &bull; ₹{lot.price_per_unit}/{lot.unit} &bull; Total ₹{Math.round(lot.quantity * lot.price_per_unit).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <Link href={`/business/recycler/marketplace/${lot.id}`}>
                      <Button variant="subtle" size="sm">
                        Inspect
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
