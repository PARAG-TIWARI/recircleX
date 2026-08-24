"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Truck,
  Package,
  Warehouse,
  DollarSign,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  MapPin,
  ChevronRight,
  Layers,
  Phone,
  Scale,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CollectorNav } from "@/components/collector/collector-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { collectorApi, CollectorDashboardStats, CollectorPickupItem } from "@/lib/api/collector";

export default function CollectorDashboard() {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();

  const [stats, setStats] = useState<CollectorDashboardStats | null>(null);
  const [assignedPickups, setAssignedPickups] = useState<CollectorPickupItem[]>([]);
  const [availablePickups, setAvailablePickups] = useState<CollectorPickupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, assignedRes, availableRes] = await Promise.allSettled([
        collectorApi.getDashboardStats(),
        collectorApi.getPickups("assigned", 10, 0),
        collectorApi.getPickups("available", 10, 0),
      ]);

      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value);
      }
      if (assignedRes.status === "fulfilled") {
        setAssignedPickups(assignedRes.value.items);
      }
      if (availableRes.status === "fulfilled") {
        setAvailablePickups(availableRes.value.items);
      }
    } catch (e) {
      console.error("Collector dashboard fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchData();
    }
  }, [isLoaded]);

  const handleStartPickup = async (id: string) => {
    try {
      await collectorApi.startPickup(id);
      toast("Pickup started! Status updated to On The Way.", "success");
      fetchData();
    } catch (e: any) {
      toast(e.message || "Failed to start pickup", "error");
    }
  };

  const userName = user?.firstName || user?.fullName || "Collection Partner";
  const activePickup = assignedPickups.find((p) => p.status === "ON_THE_WAY") || assignedPickups[0];

  return (
    <div className="min-h-screen bg-[#F5F7F9] text-slate-900 flex flex-col justify-between">
      <Navbar />
      <CollectorNav />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: "Collector Operations" },
            { label: "Dashboard" },
          ]}
          title={`Collector Dispatch Hub — ${userName}`}
          description="Territory job queue, turn-by-turn route navigation, doorstep digital scale verification, and warehouse inventory lots."
          action={
            <Link href="/individual/collector/pickups">
              <Button variant="primary" size="default" leftIcon={<Truck className="h-4 w-4" />}>
                View Available Jobs ({availablePickups.length})
              </Button>
            </Link>
          }
        />

        {/* Operational Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Inventory Stock
                </span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">
                  {(stats?.current_inventory_kg || 0).toFixed(1)} <span className="text-xs font-normal text-slate-500">kg</span>
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
                <Package className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Stock Value
                </span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">
                  ₹{(stats?.estimated_inventory_value_inr || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Pickups Completed
                </span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">
                  {stats?.completed_pickups_count || 0}
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Today's Pickups
                </span>
                <span className="text-xl font-bold text-teal-800 mt-1 block">
                  {stats?.todays_pickups_count || 0} <span className="text-xs font-normal text-slate-500">jobs</span>
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
                <Warehouse className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Active Job Card */}
        {activePickup && (
          <Card className="border-teal-300 bg-white">
            <CardHeader className="bg-teal-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0F766E] animate-ping" />
                <CardTitle className="text-sm">Current Active Job in Territory</CardTitle>
              </div>
              <StatusBadge status={activePickup.status} />
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                    Job ID
                  </span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                    #{activePickup.id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                    Customer Address
                  </span>
                  <span className="font-semibold text-slate-900 mt-0.5 block truncate">
                    {activePickup.address_snapshot?.street_address || "Registered Address"}, {activePickup.address_snapshot?.city}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                    Time Window
                  </span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    {activePickup.preferred_time}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                    Material / Est. Weight
                  </span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    {activePickup.material || "Recyclable Scrap"} ({activePickup.quantity || 10} kg)
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <ShieldCheck className="h-4 w-4 text-[#0F766E]" />
                  <span>Bring certified digital hanging scale & tare zero before weighing.</span>
                </div>

                <div className="flex items-center gap-2">
                  {activePickup.status === "ASSIGNED" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Navigation className="h-3.5 w-3.5" />}
                      onClick={() => handleStartPickup(activePickup.id)}
                    >
                      Start Route (On The Way)
                    </Button>
                  )}

                  <Link href={`/individual/collector/pickups/${activePickup.id}`}>
                    <Button variant="primary" size="sm" leftIcon={<Scale className="h-3.5 w-3.5" />}>
                      Weigh & Complete Intake
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assigned Pickups vs Available Queue Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Assigned Jobs (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Assigned Route Schedule ({assignedPickups.length})
              </h2>
              <Link
                href="/individual/collector/pickups"
                className="text-xs font-semibold text-[#0F766E] hover:underline"
              >
                All pickup jobs &rarr;
              </Link>
            </div>

            {assignedPickups.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-xs text-slate-400">
                  No pickups currently assigned to your route. Accept new jobs from the queue.
                </CardContent>
              </Card>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Customer Area</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedPickups.slice(0, 5).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono font-bold text-slate-700">
                        #{p.id.slice(-6).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-slate-800 font-medium truncate max-w-[140px]">
                        {p.address_snapshot?.street_address || "Mumbai"}
                      </TableCell>
                      <TableCell className="text-slate-600">{p.preferred_time}</TableCell>
                      <TableCell>
                        <StatusBadge status={p.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/individual/collector/pickups/${p.id}`}>
                          <Button variant="subtle" size="sm">
                            Open
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Right: Available Territory Queue (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Available in Territory ({availablePickups.length})
              </h2>
              <Link
                href="/individual/collector/pickups"
                className="text-xs font-semibold text-[#0F766E] hover:underline"
              >
                Explore &rarr;
              </Link>
            </div>

            {availablePickups.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-xs text-slate-400">
                  No unassigned pickups in your territory right now.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {availablePickups.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">
                          #{p.id.slice(-6).toUpperCase()}
                        </span>
                        <Badge variant="info">New Job</Badge>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium truncate">
                        {p.address_snapshot?.street_address || "Mumbai Zone 1"}
                      </p>
                      <p className="text-[10px] text-slate-400">Slot: {p.preferred_time}</p>
                    </div>

                    <Link href={`/individual/collector/pickups/${p.id}`}>
                      <Button variant="primary" size="sm">
                        Accept
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
