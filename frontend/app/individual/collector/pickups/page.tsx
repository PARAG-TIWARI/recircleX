"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Truck,
  Package,
  Layers,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  ArrowRight,
  Filter,
  Scale,
  Search,
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
import { collectorApi, CollectorPickupItem } from "@/lib/api/collector";

export default function CollectorPickupsPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "available";
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"available" | "assigned" | "completed">(
    initialTab as any
  );
  const [pickups, setPickups] = useState<CollectorPickupItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchPickups = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await collectorApi.getPickups(activeTab, 50, 0);
      setPickups(res.items);
    } catch (e) {
      console.error("Fetch collector pickups error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchPickups();
  }, [fetchPickups]);

  const handleAccept = async (id: string) => {
    setActionLoadingId(id);
    try {
      await collectorApi.acceptPickup(id);
      toast("Pickup accepted! Added to your assigned route queue.", "success");
      setActiveTab("assigned");
    } catch (e: any) {
      toast(e.message || "Failed to accept pickup", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStart = async (id: string) => {
    setActionLoadingId(id);
    try {
      await collectorApi.startPickup(id);
      toast("Pickup started! Customer notified that you are on the way.", "success");
      fetchPickups();
    } catch (e: any) {
      toast(e.message || "Failed to start pickup", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredPickups = pickups.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      (p.address_snapshot?.street_address || "").toLowerCase().includes(q) ||
      (p.address_snapshot?.city || "").toLowerCase().includes(q) ||
      (p.material || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F5F7F9] text-slate-900 flex flex-col justify-between">
      <Navbar />
      <CollectorNav />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: "Collector Operations", href: "/individual/collector" },
            { label: "Job Queue" },
          ]}
          title="Pickup Route & Job Queue"
          description="Review territory scrap collection requests, accept jobs into daily routes, and perform digital scale weighing intakes."
          action={
            <Link href="/individual/collector/map">
              <Button variant="secondary" size="default" leftIcon={<Navigation className="h-4 w-4" />}>
                GPS Route Dispatch Map
              </Button>
            </Link>
          }
        />

        {/* Tab Selection & Search Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab("available")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${activeTab === "available"
                  ? "bg-[#0F766E] text-white"
                  : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              Available in Territory
            </button>
            <button
              onClick={() => setActiveTab("assigned")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${activeTab === "assigned"
                  ? "bg-[#0F766E] text-white"
                  : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              My Assigned Routes
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${activeTab === "completed"
                  ? "bg-[#0F766E] text-white"
                  : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              Completed Intakes
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by address, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs rounded-md border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:border-[#0F766E]"
            />
          </div>
        </div>

        {/* Dense Enterprise Job Data Table */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading territory jobs...</div>
        ) : filteredPickups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-xs text-slate-400">
              No pickup jobs matching current filter.
            </CardContent>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Customer Address</TableHead>
                <TableHead>Time Slot</TableHead>
                <TableHead>Material / Est. Weight</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPickups.map((p) => {
                const isActionLoading = actionLoadingId === p.id;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono font-bold text-slate-800">
                      #{p.id.slice(-6).toUpperCase()}
                    </TableCell>

                    <TableCell className="font-medium text-slate-900 max-w-xs">
                      <div className="truncate">{p.address_snapshot?.street_address || "Customer Address"}</div>
                      <span className="text-[11px] text-slate-500 font-normal">
                        {p.address_snapshot?.city || "Mumbai"} &bull; {p.address_snapshot?.postal_code || "400001"}
                      </span>
                    </TableCell>

                    <TableCell className="text-slate-700 font-medium whitespace-nowrap">
                      {p.preferred_time}
                    </TableCell>

                    <TableCell className="text-slate-800 whitespace-nowrap">
                      <span className="font-semibold block">{p.material || "Recyclable Scrap"}</span>
                      <span className="text-[11px] text-slate-500">{p.quantity || 10} kg &bull; Grade A</span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>

                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {activeTab === "available" && (
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={isActionLoading}
                            onClick={() => handleAccept(p.id)}
                          >
                            Accept Job
                          </Button>
                        )}

                        {activeTab === "assigned" && (
                          <>
                            {p.status === "ASSIGNED" && (
                              <Button
                                variant="secondary"
                                size="sm"
                                isLoading={isActionLoading}
                                onClick={() => handleStart(p.id)}
                              >
                                Start Route
                              </Button>
                            )}

                            <Link href={`/individual/collector/pickups/${p.id}`}>
                              <Button
                                variant={p.status === "ON_THE_WAY" ? "primary" : "outline"}
                                size="sm"
                                leftIcon={<Scale className="h-3 w-3" />}
                              >
                                {p.status === "ON_THE_WAY" ? "Weigh & Intake" : "View"}
                              </Button>
                            </Link>
                          </>
                        )}

                        {activeTab === "completed" && (
                          <Link href={`/individual/collector/pickups/${p.id}`}>
                            <Button variant="outline" size="sm">
                              View Receipt
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </main>

      <Footer />
    </div>
  );
}
