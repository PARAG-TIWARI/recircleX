"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Truck,
  Package,
  ArrowLeft,
  Calendar,
  Layers,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  Scale,
  DollarSign,
  Phone,
  ShieldCheck,
  X,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CollectorNav } from "@/components/collector/collector-nav";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { collectorApi, CollectorPickupItem } from "@/lib/api/collector";

export default function CollectorPickupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const pickupId = params?.id as string;

  const [pickup, setPickup] = useState<CollectorPickupItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Complete & Intake Modal State
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [actualWeight, setActualWeight] = useState<number>(5.0);
  const [finalAmount, setFinalAmount] = useState<number>(180.0);
  const [intakeNotes, setIntakeNotes] = useState<string>("");

  const fetchPickup = useCallback(async () => {
    if (!pickupId) return;
    try {
      const res = await collectorApi.getPickupDetail(pickupId);
      setPickup(res);
      setActualWeight(res.quantity || 5.0);
      setFinalAmount(res.final_amount || 180.0);
    } catch (err: any) {
      toast(err.message || "Failed to load pickup", "error");
    } finally {
      setIsLoading(false);
    }
  }, [pickupId, toast]);

  useEffect(() => {
    fetchPickup();
  }, [fetchPickup]);

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      const updated = await collectorApi.acceptPickup(pickupId);
      setPickup(updated);
      toast("Pickup accepted! Assigned to your route.", "success");
    } catch (e: any) {
      toast(e.message || "Failed to accept pickup", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async () => {
    setActionLoading(true);
    try {
      const updated = await collectorApi.startPickup(pickupId);
      setPickup(updated);
      toast("Pickup started! Household notified that you are on the way.", "success");
    } catch (e: any) {
      toast(e.message || "Failed to start pickup", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const updated = await collectorApi.completePickup(pickupId, {
        actual_weight: actualWeight,
        final_amount: finalAmount,
        notes: intakeNotes || undefined,
      });
      setPickup(updated);
      setShowCompleteModal(false);
      toast("Pickup marked as collected! Material added to your Inventory.", "success");
    } catch (e: any) {
      toast(e.message || "Failed to complete pickup", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Google Maps navigation url
  const address = pickup?.address_snapshot;
  const destinationQuery = encodeURIComponent(
    `${address?.street_address || ""}, ${address?.city || "Mumbai"}, ${address?.postal_code || ""}`
  );
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <CollectorNav />
        <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
          Loading pickup details...
        </div>
        <Footer />
      </div>
    );
  }

  if (!pickup) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <CollectorNav />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
          <p className="text-sm font-bold text-slate-800">Pickup not found or access denied.</p>
          <Link
            href="/individual/collector/pickups"
            className="rounded-xl bg-emerald-600 text-white font-bold text-xs px-4 py-2"
          >
            Back to Pickups
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-16 md:pb-0">
      <Navbar />
      <CollectorNav />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation back */}
        <Link
          href="/individual/collector/pickups"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Pickups
        </Link>

        {/* Pickup Inspection Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  {pickup.category}
                </span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-xs text-slate-500">
                  Requested {new Date(pickup.created_at).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900">{pickup.listing_title}</h1>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="neutral"
                className={`text-xs font-bold px-3 py-1 ${pickup.status === "REQUESTED"
                    ? "bg-amber-500 text-white border-none"
                    : pickup.status === "ASSIGNED"
                      ? "bg-blue-600 text-white border-none"
                      : pickup.status === "ON_THE_WAY"
                        ? "bg-teal-600 text-white border-none"
                        : "bg-emerald-600 text-white border-none"
                  }`}
              >
                {pickup.status.replace("_", " ")}
              </Badge>
            </div>
          </div>

          {/* Body Content */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="h-64 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
              {pickup.images && pickup.images.length > 0 ? (
                <img src={pickup.images[0]} alt={pickup.listing_title} className="h-full w-full object-cover" />
              ) : (
                <div className="text-slate-400 text-xs flex flex-col items-center gap-1">
                  <Layers className="h-8 w-8 text-slate-300" />
                  <span>No image provided</span>
                </div>
              )}
            </div>

            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Estimated Payout Value
                  </span>
                  <div className="text-2xl font-black text-emerald-700">
                    {pickup.estimated_price_range || `₹${pickup.final_amount || 180}`}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Weigh and settle digitally on-site upon arrival
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 font-bold block mb-0.5">Material:</span>
                    <p className="font-black text-slate-900">{pickup.material}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 font-bold block mb-0.5">Quantity:</span>
                    <p className="font-black text-slate-900">{pickup.quantity} {pickup.unit}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 font-bold block mb-0.5">Preferred Slot:</span>
                    <p className="font-black text-slate-900">{pickup.preferred_time}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 font-bold block mb-0.5">Location Area:</span>
                    <p className="font-black text-slate-900 truncate">{pickup.location_area}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {pickup.status === "REQUESTED" && (
                  <button
                    onClick={handleAccept}
                    disabled={actionLoading}
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-3 text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{actionLoading ? "Accepting..." : "Accept This Pickup Request"}</span>
                  </button>
                )}

                {pickup.status === "ASSIGNED" && (
                  <div className="flex gap-2">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 text-xs text-center shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Navigation className="h-4 w-4 text-blue-600" />
                      <span>Navigate via Maps</span>
                    </a>
                    <button
                      onClick={handleStart}
                      disabled={actionLoading}
                      className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-3 text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Truck className="h-4 w-4" />
                      <span>Start Pickup (On the Way)</span>
                    </button>
                  </div>
                )}

                {pickup.status === "ON_THE_WAY" && (
                  <div className="flex gap-2">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold px-4 py-3 text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Navigation className="h-4 w-4 text-blue-600" />
                      <span>Maps</span>
                    </a>
                    <button
                      onClick={() => setShowCompleteModal(true)}
                      className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Scale className="h-4 w-4" />
                      <span>Mark as Collected & Digital Scale Intake</span>
                    </button>
                  </div>
                )}

                {pickup.status === "COLLECTED" && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Collected: {pickup.actual_weight || pickup.quantity} kg &bull; Payout: ₹{pickup.final_amount}</span>
                    </div>
                    <Link
                      href="/individual/collector/inventory"
                      className="text-emerald-700 font-bold underline"
                    >
                      View in Inventory
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Household Address & Special Notes */}
          <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                Pickup Address:
              </span>
              <p className="text-slate-800 font-medium">
                {address?.street_address || "Home Address"}, {address?.city || "Mumbai"} ({address?.postal_code || ""})
              </p>
              {address?.landmark && (
                <p className="text-[11px] text-slate-500">Landmark: {address.landmark}</p>
              )}
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                Pickup Instructions:
              </span>
              <p className="text-slate-600">
                {pickup.notes || "No special instructions provided."}
              </p>
            </div>
          </div>
        </div>

        {/* Complete & Digital Weighing Modal */}
        {showCompleteModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-black text-slate-900 text-base">Digital Scale Weighing Intake</h3>
                </div>
                <button onClick={() => setShowCompleteModal(false)} className="text-slate-400 hover:text-slate-800">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCompleteSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Verified Digital Scale Weight (kg):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={actualWeight}
                    onChange={(e) => {
                      const w = parseFloat(e.target.value) || 0;
                      setActualWeight(w);
                      setFinalAmount(Math.round(w * 34)); // auto estimate based on ~₹34/kg
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Final Instant Payout Amount (INR ₹):
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={finalAmount}
                    onChange={(e) => setFinalAmount(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-black text-emerald-600 focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Intake Remarks (Optional):</label>
                  <input
                    type="text"
                    value={intakeNotes}
                    onChange={(e) => setIntakeNotes(e.target.value)}
                    placeholder="e.g. Segregated clean bottles, digital receipt verified"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800">
                  Completing this intake will atomically move the material into your warehouse <strong>Inventory</strong> and notify the household.
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCompleteModal(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-2.5 shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{actionLoading ? "Processing..." : "Confirm & Save Intake"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
