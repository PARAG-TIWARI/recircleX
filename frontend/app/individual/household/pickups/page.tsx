"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  User,
  Phone,
  Package,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HouseholdNav } from "@/components/household/household-nav";
import { EcoBotFloating } from "@/components/household/ecobot-floating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { pickupsApi, PickupItem } from "@/lib/api/pickups";

export default function MyPickupsPage() {
  const [pickups, setPickups] = useState<PickupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPickups() {
      try {
        const res = await pickupsApi.getMyPickups(50, 0);
        setPickups(res.items);
      } catch (e) {
        console.error("Fetch pickups error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPickups();
  }, []);

  const getStageIndex = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return 0;
      case "ASSIGNED":
        return 1;
      case "ON_THE_WAY":
        return 2;
      case "COLLECTED":
        return 3;
      default:
        return 0;
    }
  };

  const STAGES = [
    { title: "Request Submitted", desc: "Broadcasted to nearby collection depots" },
    { title: "Partner Assigned", desc: "Collector dispatched on territory route" },
    { title: "On The Way", desc: "Vehicle arriving with digital scale" },
    { title: "Intake Weighed", desc: "Material verified & payout settled" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7F9] text-slate-900 flex flex-col justify-between">
      <Navbar />
      <HouseholdNav />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: "Household Portal", href: "/individual/household" },
            { label: "Pickup Requests" },
          ]}
          title="Doorstep Pickup Management"
          description="Track live collection partner dispatch, inspect doorstep scale weights, and view payout receipts."
          action={
            <Link href="/individual/household/create-listing">
              <Button variant="primary" size="default" leftIcon={<Calendar className="h-4 w-4" />}>
                Schedule New Pickup
              </Button>
            </Link>
          }
        />

        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading pickups...</div>
        ) : pickups.length === 0 ? (
          <Card className="max-w-md mx-auto text-center p-8">
            <CardContent className="space-y-4 p-0">
              <div className="h-12 w-12 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No Pickup Requests Yet</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Create a scrap listing from your home and request a 15-minute collection.
                </p>
              </div>
              <Link href="/individual/household/create-listing">
                <Button variant="primary" size="default">
                  Create Scrap Listing
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Active Pickups Detailed Cards */}
            {pickups.filter((p) => ["REQUESTED", "ASSIGNED", "ON_THE_WAY"].includes(p.status)).length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Active Dispatch Tracks
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {pickups
                    .filter((p) => ["REQUESTED", "ASSIGNED", "ON_THE_WAY"].includes(p.status))
                    .map((pickup) => {
                      const currentStage = getStageIndex(pickup.status);
                      return (
                        <Card key={pickup.id} className="border-teal-200 bg-white">
                          <CardHeader className="bg-teal-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center">
                                <Truck className="h-4 w-4" />
                              </div>
                              <div>
                                <span className="font-mono text-xs font-bold text-slate-700">
                                  PICKUP #{pickup.id.slice(-6).toUpperCase()}
                                </span>
                                <span className="text-xs text-slate-500 block">
                                  Time Slot: {pickup.preferred_time}
                                </span>
                              </div>
                            </div>
                            <StatusBadge status={pickup.status} />
                          </CardHeader>

                          <CardContent className="p-5 space-y-5">
                            {/* Step Progress Bar */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                              {STAGES.map((stg, sIdx) => {
                                const isPassed = sIdx < currentStage;
                                const isCurrent = sIdx === currentStage;
                                return (
                                  <div
                                    key={sIdx}
                                    className={`p-2.5 rounded-md border text-xs ${
                                      isPassed
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                        : isCurrent
                                        ? "bg-teal-50 border-teal-300 text-[#0F766E] font-semibold"
                                        : "bg-slate-50 border-slate-200 text-slate-400"
                                    }`}
                                  >
                                    <div className="font-semibold flex items-center gap-1">
                                      {isPassed ? (
                                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                      ) : isCurrent ? (
                                        <span className="h-2 w-2 rounded-full bg-[#0F766E] animate-ping" />
                                      ) : (
                                        <span className="h-2 w-2 rounded-full bg-slate-300" />
                                      )}
                                      <span>{stg.title}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                                      {stg.desc}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                                  Pickup Location
                                </span>
                                <p className="font-medium text-slate-800 mt-0.5">
                                  {pickup.address_snapshot?.street_address || "Home Address"}, {pickup.address_snapshot?.city}
                                </p>
                              </div>

                              <div>
                                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                                  Assigned Collector
                                </span>
                                <p className="font-medium text-slate-800 mt-0.5">
                                  {pickup.collector_id ? "Authorized Depot Partner #402" : "Dispatching..."}
                                </p>
                              </div>

                              <div>
                                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                                  Estimated Scale Intake
                                </span>
                                <p className="font-medium text-slate-800 mt-0.5">
                                  Calibrated IoT Scale Verification
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Complete Pickups Data Table */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Pickup History & Receipts
              </h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pickup ID</TableHead>
                    <TableHead>Preferred Slot</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actual Weight</TableHead>
                    <TableHead>Payout Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pickups.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono font-bold text-slate-700">
                        #{p.id.slice(-6).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">{p.preferred_time}</TableCell>
                      <TableCell className="text-slate-600 truncate max-w-xs">
                        {p.address_snapshot?.street_address || "Registered Address"}
                      </TableCell>
                      <TableCell className="text-slate-800 font-semibold">
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
            </div>
          </div>
        )}
      </main>

      <EcoBotFloating />
      <Footer />
    </div>
  );
}
