"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Navigation,
  Truck,
  Compass,
  Layers,
  ArrowRight,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CollectorNav } from "@/components/collector/collector-nav";
import { Badge } from "@/components/ui/badge";
import { collectorApi, CollectorPickupItem } from "@/lib/api/collector";

export default function CollectorMapPage() {
  const [pickups, setPickups] = useState<CollectorPickupItem[]>([]);
  const [selectedPickup, setSelectedPickup] = useState<CollectorPickupItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMapData() {
      try {
        const res = await collectorApi.getPickups("assigned", 20, 0);
        setPickups(res.items);
        if (res.items.length > 0) {
          setSelectedPickup(res.items[0]);
        }
      } catch (e) {
        console.error("Map fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadMapData();
  }, []);

  const address = selectedPickup?.address_snapshot;
  const destQuery = encodeURIComponent(
    `${address?.street_address || ""}, ${address?.city || "Mumbai"} ${address?.postal_code || ""}`
  );
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destQuery}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-16 md:pb-0">
      <Navbar />
      <CollectorNav />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Field Route & Map View
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live route coordinates and turn-by-turn dispatch navigation for assigned pickups.
            </p>
          </div>

          {selectedPickup && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 text-xs shadow-sm transition-all"
            >
              <Navigation className="h-4 w-4" />
              <span>Launch Google Maps Route</span>
            </a>
          )}
        </div>

        {/* Map Workspace Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Visual Map Canvas / Demo Map */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs relative min-h-[460px] flex flex-col justify-between">
            {/* Mock Map Background Layer */}
            <div className="absolute inset-0 bg-slate-100 opacity-90">
              <svg className="w-full h-full text-slate-200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Map Top Overlay */}
            <div className="relative z-10 p-5 flex items-center justify-between bg-gradient-to-b from-white/90 to-transparent">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs border border-slate-200 px-3.5 py-1.5 rounded-full shadow-2xs text-xs font-bold text-slate-800">
                <Compass className="h-3.5 w-3.5 text-emerald-600 animate-spin" />
                <span>GPS Location: Metro Hub Zone 1 (Active)</span>
              </div>
              <Badge variant="brand" className="bg-emerald-100 text-emerald-800 border-none text-xs">
                {pickups.length} Assigned Stops
              </Badge>
            </div>

            {/* Route Pins Visualization */}
            <div className="relative z-10 p-8 flex flex-col items-center justify-center space-y-6">
              <div className="flex items-center gap-6 flex-wrap justify-center">
                {/* Collector Pin */}
                <div className="flex flex-col items-center animate-pulse">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg ring-4 ring-blue-100">
                    <Truck className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-md mt-1 shadow-2xs">
                    Your Van (Live)
                  </span>
                </div>

                <div className="h-0.5 w-24 bg-dashed border-t-2 border-dashed border-emerald-500 hidden sm:block" />

                {/* Destination Pin */}
                {selectedPickup && (
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg ring-4 ring-emerald-100">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-md mt-1 shadow-2xs truncate max-w-[140px]">
                      {selectedPickup.location_area}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Map Bottom Bar */}
            <div className="relative z-10 p-4 bg-white/95 backdrop-blur-xs border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                <span>Selected Destination: </span>
                <strong className="text-slate-900">{selectedPickup?.listing_title || "None selected"}</strong>
              </div>
              {selectedPickup && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 text-xs shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Navigate to Pickup</span>
                </a>
              )}
            </div>
          </div>

          {/* Route Stops List Sidebar */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Assigned Route Stops</h3>
              <p className="text-xs text-slate-500">Pickups assigned to your daily route</p>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading stops...</div>
            ) : pickups.length === 0 ? (
              <div className="py-12 text-center space-y-2 text-xs text-slate-400">
                <p className="font-bold text-slate-700">No assigned route stops</p>
                <p>Accept pickups from the Available Pool to build your route.</p>
                <Link
                  href="/individual/collector/pickups"
                  className="inline-block mt-2 font-bold text-emerald-600 hover:underline"
                >
                  View Available Pickups &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {pickups.map((p, idx) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPickup(p)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      selectedPickup?.id === p.id
                        ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20"
                        : "bg-slate-50 border-slate-100 hover:bg-slate-100/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </div>
                        <span className="font-bold text-xs text-slate-900">{p.listing_title}</span>
                      </div>
                      <Badge variant="neutral" className="text-[9px] bg-slate-200 text-slate-800 border-none">
                        {p.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                      <p>Time: <strong className="text-slate-800">{p.preferred_time}</strong></p>
                      <p className="truncate">Area: {p.location_area}</p>
                    </div>
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
