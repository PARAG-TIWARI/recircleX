"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  PlusCircle,
  Package,
  Truck,
  Leaf,
  DollarSign,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Camera,
  Layers,
  ChevronRight,
  MapPin,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HouseholdNav } from "@/components/household/household-nav";
import { EcoBotFloating } from "@/components/household/ecobot-floating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { listingsApi, ListingItem } from "@/lib/api/listings";
import { pickupsApi, PickupItem } from "@/lib/api/pickups";
import { impactApi, HouseholdImpactData } from "@/lib/api/impact";
import { addressesApi, AddressItem } from "@/lib/api/addresses";

export default function HouseholdDashboard() {
  const { user, isLoaded } = useUser();

  const [listings, setListings] = useState<ListingItem[]>([]);
  const [pickups, setPickups] = useState<PickupItem[]>([]);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [impact, setImpact] = useState<HouseholdImpactData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userName = user?.firstName || user?.fullName || "Citizen Member";

  useEffect(() => {
    async function fetchData() {
      try {
        const [listingsRes, pickupsRes, impactRes, addressesRes] = await Promise.allSettled([
          listingsApi.getMyListings(10, 0),
          pickupsApi.getMyPickups(10, 0),
          impactApi.getHouseholdImpact(),
          addressesApi.getAddresses(),
        ]);

        if (listingsRes.status === "fulfilled") {
          setListings(listingsRes.value.items);
        }
        if (pickupsRes.status === "fulfilled") {
          setPickups(pickupsRes.value.items);
        }
        if (impactRes.status === "fulfilled") {
          setImpact(impactRes.value);
        }
        if (addressesRes.status === "fulfilled") {
          setAddresses(addressesRes.value);
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    }

    if (isLoaded) {
      fetchData();
    }
  }, [isLoaded]);

  // Find active / in-flight pickup
  const activePickup = pickups.find(
    (p) => ["REQUESTED", "ASSIGNED", "ON_THE_WAY"].includes(p.status)
  );

  const totalRecycled = impact?.total_material_recycled_kg || 0;
  const estimatedEarnings = impact?.estimated_earnings_inr || 0;
  const co2Avoided = impact?.estimated_co2_offset_kg || 0;
  const activeListings = listings.filter((l) => l.status === "AVAILABLE");

  return (
    <div className="min-h-screen bg-[#F5F7F9] text-slate-900 flex flex-col justify-between">
      <Navbar />
      <HouseholdNav />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page Header */}
        <PageHeader
          breadcrumbs={[{ label: "Household Portal" }, { label: "Overview" }]}
          title={`Welcome, ${userName}`}
          description="Manage your household recyclable scrap, track doorstep pickup status, and monitor environmental impact."
          action={
            <Link href="/individual/household/create-listing">
              <Button variant="primary" size="default" leftIcon={<Calendar className="h-4 w-4" />}>
                Schedule Scrap Pickup
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
                  Material Recycled
                </span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">
                  {totalRecycled.toFixed(1)} <span className="text-xs font-normal text-slate-500">kg</span>
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
                  Total Earnings
                </span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">
                  ₹{estimatedEarnings.toLocaleString("en-IN")}
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
                  Active Listings
                </span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">
                  {activeListings.length}
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  CO₂ Emissions Avoided
                </span>
                <span className="text-xl font-bold text-teal-800 mt-1 block">
                  {co2Avoided.toFixed(1)} <span className="text-xs font-normal text-slate-500">kg</span>
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
                <Leaf className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Pickup Real-Time Status Card */}
        {activePickup ? (
          <Card className="border-teal-300 bg-white">
            <CardHeader className="bg-teal-50/60">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0F766E] animate-ping" />
                <CardTitle className="text-sm">Active Doorstep Pickup in Progress</CardTitle>
              </div>
              <StatusBadge status={activePickup.status} />
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                    Scheduled Time Slot
                  </span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    {activePickup.preferred_time}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                    Pickup Address
                  </span>
                  <span className="font-semibold text-slate-900 mt-0.5 block truncate">
                    {activePickup.address_snapshot?.street_address || "Registered Address"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                    Verification Method
                  </span>
                  <span className="font-semibold text-slate-900 mt-0.5 block flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#0F766E]" />
                    Calibrated Digital Scale
                  </span>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="pt-3 border-t border-slate-100">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div
                    className={`p-2 rounded-md border ${
                      ["REQUESTED", "ASSIGNED", "ON_THE_WAY"].includes(activePickup.status)
                        ? "bg-teal-50 border-teal-200 text-[#0F766E] font-semibold"
                        : "bg-slate-50 text-slate-400 border-slate-200"
                    }`}
                  >
                    1. Request Created
                  </div>
                  <div
                    className={`p-2 rounded-md border ${
                      ["ASSIGNED", "ON_THE_WAY"].includes(activePickup.status)
                        ? "bg-teal-50 border-teal-200 text-[#0F766E] font-semibold"
                        : "bg-slate-50 text-slate-400 border-slate-200"
                    }`}
                  >
                    2. Collector Assigned
                  </div>
                  <div
                    className={`p-2 rounded-md border ${
                      activePickup.status === "ON_THE_WAY"
                        ? "bg-teal-50 border-teal-200 text-[#0F766E] font-semibold"
                        : "bg-slate-50 text-slate-400 border-slate-200"
                    }`}
                  >
                    3. On The Way
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white border-slate-200">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-sm font-bold text-slate-900">No Pending Pickups</h3>
                <p className="text-xs text-slate-500">
                  Ready to recycle? Upload photos or select materials to request a 15-minute doorstep collection.
                </p>
              </div>
              <Link href="/individual/household/create-listing">
                <Button variant="primary" size="default" leftIcon={<PlusCircle className="h-4 w-4" />}>
                  Create Scrap Listing
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Two-Column Grid: Recent Pickups & Available Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Recent Pickups Table (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Doorstep Pickups
              </h2>
              <Link
                href="/individual/household/pickups"
                className="text-xs font-semibold text-[#0F766E] hover:underline"
              >
                View all pickups &rarr;
              </Link>
            </div>

            {pickups.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-xs text-slate-400">
                  No pickup history yet. Create your first listing to schedule a collection.
                </CardContent>
              </Card>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pickup ID</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Payout</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pickups.slice(0, 5).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-slate-600 font-semibold">
                        #{p.id.slice(-6).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {p.preferred_time}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {p.actual_weight ? `${p.actual_weight} kg` : "Pending scale"}
                      </TableCell>
                      <TableCell className="font-bold text-slate-900">
                        {p.final_amount ? `₹${p.final_amount}` : "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={p.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Right: Available Listings & Saved Addresses (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Available Scrap Listings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  My Scrap Inventory
                </h2>
                <Link
                  href="/individual/household/listings"
                  className="text-xs font-semibold text-[#0F766E] hover:underline"
                >
                  Manage &rarr;
                </Link>
              </div>

              {listings.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-xs text-slate-400">
                    No active scrap listings.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2.5">
                  {listings.slice(0, 3).map((l) => (
                    <div
                      key={l.id}
                      className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{l.title}</h4>
                          <StatusBadge status={l.status} showIcon={false} />
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {l.category} &bull; {l.quantity} {l.unit} &bull; Est. {l.estimated_price_range || `₹${l.estimated_price}`}
                        </p>
                      </div>

                      {l.status === "AVAILABLE" && (
                        <Link href="/individual/household/create-listing">
                          <Button variant="subtle" size="sm">
                            Schedule
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Addresses Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Pickup Addresses
                </h2>
                <Link
                  href="/individual/household/profile"
                  className="text-xs font-semibold text-[#0F766E] hover:underline"
                >
                  Manage addresses &rarr;
                </Link>
              </div>

              {addresses.length === 0 ? (
                <Card>
                  <CardContent className="p-4 text-center text-xs text-slate-400">
                    No saved addresses. Add an address to speed up booking.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {addresses.slice(0, 2).map((addr) => (
                    <div
                      key={addr.id}
                      className="p-3 rounded-lg border border-slate-200 bg-white text-xs flex items-start gap-2.5"
                    >
                      <MapPin className="h-4 w-4 text-[#0F766E] shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{addr.label || "Home"}</span>
                          {addr.is_default && <Badge variant="success">Default</Badge>}
                        </div>
                        <p className="text-slate-600">
                          {addr.street_address}, {addr.city} – {addr.postal_code}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <EcoBotFloating />
      <Footer />
    </div>
  );
}
