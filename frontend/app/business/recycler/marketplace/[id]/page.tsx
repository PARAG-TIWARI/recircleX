"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Leaf,
  Layers,
  Phone,
  CheckCircle2,
  Calendar,
  DollarSign,
  Truck,
  X,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RecyclerNav } from "@/components/recycler/recycler-nav";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { marketplaceApi, MarketplaceListingItem } from "@/lib/api/marketplace";

export default function MarketplaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const listingId = params?.id as string;

  const [listing, setListing] = useState<MarketplaceListingItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReserving, setIsReserving] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reservationNotes, setReservationNotes] = useState("");

  const fetchDetail = async () => {
    if (!listingId) return;
    try {
      const res = await marketplaceApi.getListingDetail(listingId);
      setListing(res);
    } catch (e: any) {
      toast(e.message || "Failed to load listing details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [listingId]);

  const handleConfirmReservation = async () => {
    setIsReserving(true);
    try {
      const order = await marketplaceApi.reserveListing(listingId, {
        notes: reservationNotes || undefined,
      });
      setShowReserveModal(false);
      toast("Lot reserved successfully! B2B Contract Order created.", "success");
      router.push(`/business/recycler/orders/${order.id}`);
    } catch (e: any) {
      toast(e.message || "Failed to reserve material", "error");
      setIsReserving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <RecyclerNav />
        <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
          Loading material lot details...
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <RecyclerNav />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
          <p className="text-sm font-bold text-slate-800">Marketplace lot not found</p>
          <Link
            href="/business/recycler/marketplace"
            className="rounded-xl bg-emerald-600 text-white font-bold text-xs px-4 py-2"
          >
            Back to Marketplace
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-16 md:pb-0">
      <Navbar />
      <RecyclerNav />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Back */}
        <Link
          href="/business/recycler/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Marketplace
        </Link>

        {/* Listing Detail Hero Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image / Gallery */}
            <div className="h-72 sm:h-96 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 relative flex items-center justify-center">
              {listing.images && listing.images.length > 0 ? (
                <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" />
              ) : (
                <div className="text-slate-400 text-xs flex flex-col items-center gap-1">
                  <Layers className="h-10 w-10 text-slate-300" />
                  <span>Pre-baled Scrap Lot</span>
                </div>
              )}

              <div className="absolute top-4 left-4">
                <Badge
                  variant="brand"
                  className="bg-white/95 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-xs backdrop-blur-xs"
                >
                  {listing.quality} Quality
                </Badge>
              </div>

              <div className="absolute top-4 right-4">
                <Badge
                  variant="neutral"
                  className={`text-xs font-bold px-2.5 py-0.5 ${
                    listing.status === "ACTIVE"
                      ? "bg-emerald-600 text-white border-none"
                      : "bg-slate-800 text-white border-none"
                  }`}
                >
                  {listing.status}
                </Badge>
              </div>
            </div>

            {/* Contract Info & CTAs */}
            <div className="space-y-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-bold uppercase tracking-wider text-emerald-700">{listing.category}</span>
                  <span>&bull;</span>
                  <span>Listed {new Date(listing.created_at).toLocaleDateString()}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {listing.title}
                </h1>

                {/* Price & Quantity Summary */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Contract Rate & Total Value
                  </span>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-black text-emerald-700">
                      ₹{listing.price_per_unit} <span className="text-xs font-semibold text-emerald-900">/ {listing.unit}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Total Lot: </span>
                      <strong className="text-base font-black text-slate-900">₹{listing.total_value}</strong>
                    </div>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Material Type:</span>
                    <strong className="text-slate-900">{listing.material}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Lot Quantity:</span>
                    <strong className="text-slate-900">{listing.quantity} {listing.unit}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Quality Standard:</span>
                    <strong className="text-slate-900">{listing.quality} Grade</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Dispatch Depot:</span>
                    <strong className="text-slate-900 truncate">{listing.seller_service_area || "Metro Zone 1"}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                {listing.status === "ACTIVE" ? (
                  <button
                    onClick={() => setShowReserveModal(true)}
                    className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                  >
                    <ShoppingBag className="h-4 w-4 transition-transform group-hover:scale-110" />
                    <span>Reserve Material Lot</span>
                  </button>
                ) : (
                  <div className="p-3.5 bg-slate-100 text-slate-600 text-xs font-bold text-center rounded-xl">
                    This material lot is currently {listing.status.toLowerCase()}.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Environmental Carbon Impact & Description */}
          <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
            {/* Description */}
            <div className="md:col-span-2 space-y-2 text-xs">
              <h3 className="font-bold text-sm text-slate-900">Technical Specifications & Intake Notes</h3>
              <p className="text-slate-600 leading-relaxed">
                {listing.description || "Segregated batch pre-screened and baled at collection facility. Meets industrial recycling input parameters with minimal contamination."}
              </p>
            </div>

            {/* Estimated Carbon Impact */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <Leaf className="h-4 w-4 text-emerald-600" />
                <span>Estimated ESG Impact</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Procuring this recycled feedstock prevents virgin resource extraction:
              </p>
              <div className="pt-1">
                <span className="text-xl font-black text-emerald-700">{listing.estimated_co2_kg} kg</span>
                <span className="text-[11px] text-emerald-900 font-semibold block">Estimated CO₂ emissions avoided</span>
              </div>
            </div>
          </div>

          {/* Supplier Info Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900">{listing.seller_name}</h4>
                  <Badge variant="brand" className="text-[9px] bg-blue-100 text-blue-800 border-none">
                    Verified Partner
                  </Badge>
                </div>
                <p className="text-slate-500 mt-0.5">
                  Rating: ★ {listing.seller_rating} &bull; Service Area: {listing.seller_service_area || "Metro Zone 1"}
                </p>
              </div>
            </div>

            <button
              onClick={() => toast(`Contacting ${listing.seller_name} for procurement queries...`, "info")}
              className="rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold px-4 py-2 text-xs transition-colors"
            >
              Contact Seller
            </button>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showReserveModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-black text-slate-900 text-base">Confirm Material Reservation</h3>
                </div>
                <button onClick={() => setShowReserveModal(false)} className="text-slate-400 hover:text-slate-800">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs space-y-1.5">
                <p className="font-bold text-slate-900 text-sm">
                  Reserve {listing.quantity} {listing.unit} of {listing.material}?
                </p>
                <div className="flex items-center justify-between pt-1 text-slate-700">
                  <span>Unit Rate:</span>
                  <span className="font-bold">₹{listing.price_per_unit}/{listing.unit}</span>
                </div>
                <div className="flex items-center justify-between text-slate-900 pt-1 border-t border-emerald-200">
                  <span className="font-bold">Total Contract Amount:</span>
                  <span className="font-black text-base text-emerald-700">₹{listing.total_value}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-700">Procurement Notes / Logistics Instructions (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule delivery to Plant Bay #3"
                  value={reservationNotes}
                  onChange={(e) => setReservationNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2 text-xs">
                <button
                  onClick={() => setShowReserveModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReservation}
                  disabled={isReserving}
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-2.5 shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isReserving ? "Creating Contract Order..." : "Confirm Reservation"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
