"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Truck,
  ArrowLeft,
  Calendar,
  Layers,
  MapPin,
  Clock,
  CheckCircle2,
  DollarSign,
  Edit3,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HouseholdNav } from "@/components/household/household-nav";
import { EcoBotFloating } from "@/components/household/ecobot-floating";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { listingsApi, ListingItem } from "@/lib/api/listings";
import { pickupsApi } from "@/lib/api/pickups";
import { addressesApi, AddressItem } from "@/lib/api/addresses";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const listingId = params?.id as string;

  const [listing, setListing] = useState<ListingItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Edit state
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editQty, setEditQty] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Pickup Request state
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [preferredTime, setPreferredTime] = useState("Today 2:00 PM – 4:00 PM");
  const [isSubmittingPickup, setIsSubmittingPickup] = useState(false);

  useEffect(() => {
    if (!listingId) return;

    listingsApi
      .getListing(listingId)
      .then((res) => {
        setListing(res);
        setEditTitle(res.title);
        setEditDesc(res.description || "");
        setEditQty(res.quantity);
      })
      .catch((err) => {
        toast(err.message || "Failed to load listing", "error");
      })
      .finally(() => {
        setIsLoading(false);
      });

    addressesApi.getAddresses().then((res) => {
      setAddresses(res);
      if (res.length > 0) {
        const def = res.find((a) => a.is_default) || res[0];
        setSelectedAddressId(def.id);
      }
    }).catch(() => {});
  }, [listingId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;
    setIsSaving(true);
    try {
      const updated = await listingsApi.updateListing(listing.id, {
        title: editTitle,
        description: editDesc,
        quantity: editQty,
      });
      setListing(updated);
      setIsEditing(false);
      toast("Listing updated successfully", "success");
    } catch (e: any) {
      toast(e.message || "Failed to update listing", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await listingsApi.deleteListing(listingId);
      toast("Listing deleted", "info");
      router.push("/individual/household/listings");
    } catch (e: any) {
      toast(e.message || "Failed to delete listing", "error");
    }
  };

  const handleRequestPickup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;
    setIsSubmittingPickup(true);
    try {
      await pickupsApi.createPickup({
        listing_id: listing.id,
        address_id: selectedAddressId || undefined,
        preferred_time: preferredTime,
      });
      toast("Pickup requested! Collection partner will be assigned.", "success");
      setShowPickupModal(false);
      router.push("/individual/household/pickups");
    } catch (err: any) {
      toast(err.message || "Failed to request pickup", "error");
    } finally {
      setIsSubmittingPickup(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <HouseholdNav />
        <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
          Loading listing details...
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <HouseholdNav />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
          <p className="text-sm font-bold text-slate-800">Listing not found or access denied.</p>
          <Link
            href="/individual/household/listings"
            className="rounded-xl bg-emerald-600 text-white font-bold text-xs px-4 py-2"
          >
            Back to My Listings
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-16 md:pb-0">
      <Navbar />
      <HouseholdNav />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation back */}
        <Link
          href="/individual/household/listings"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to My Listings
        </Link>

        {/* Listing Detail Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  {listing.category}
                </span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-xs text-slate-500">
                  Listed {new Date(listing.created_at).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900">{listing.title}</h1>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="neutral"
                className={`text-xs font-bold px-3 py-1 ${
                  listing.status === "AVAILABLE"
                    ? "bg-emerald-600 text-white border-none"
                    : "bg-slate-700 text-white border-none"
                }`}
              >
                {listing.status.replace("_", " ")}
              </Badge>
            </div>
          </div>

          {/* Image & Key Metrics */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="h-64 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
              {listing.images && listing.images.length > 0 ? (
                <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" />
              ) : (
                <div className="text-slate-400 text-xs flex flex-col items-center gap-1">
                  <Layers className="h-8 w-8 text-slate-300" />
                  <span>No photo attached</span>
                </div>
              )}
            </div>

            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Estimated Value
                  </span>
                  <div className="text-2xl font-black text-emerald-700">
                    {listing.estimated_price_range || `₹${listing.estimated_price}`}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Doorstep verified digital scale weighing
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 font-bold block mb-0.5">Material:</span>
                    <p className="font-black text-slate-900">{listing.material}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 font-bold block mb-0.5">Quantity:</span>
                    <p className="font-black text-slate-900">{listing.quantity} {listing.unit}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 font-bold block mb-0.5">Quality:</span>
                    <p className="font-black text-slate-900">{listing.quality}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 font-bold block mb-0.5">City:</span>
                    <p className="font-black text-slate-900">{listing.location?.city || "Mumbai"}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {listing.status === "AVAILABLE" && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowPickupModal(true)}
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Truck className="h-4 w-4" />
                    <span>Request Doorstep Pickup</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="rounded-xl border border-slate-200 p-3 text-slate-600 hover:bg-slate-50 transition-colors"
                    title="Edit listing"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="rounded-xl border border-slate-200 p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete listing"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description / Edit View */}
          {isEditing ? (
            <form onSubmit={handleUpdate} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <h4 className="font-bold text-slate-900">Edit Listing Details:</h4>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Title:</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description:</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity ({listing.unit}):</label>
                <input
                  type="number"
                  step="0.5"
                  value={editQty}
                  onChange={(e) => setEditQty(parseFloat(e.target.value) || 1)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-emerald-600 text-white font-bold px-4 py-2 shadow-xs"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-slate-200 bg-white text-slate-700 font-bold px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">Description</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {listing.description || "Clean segregated household scrap ready for collection."}
              </p>
            </div>
          )}
        </div>

        {/* Pickup Request Modal */}
        {showPickupModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Schedule Scrap Pickup</h3>
                <button onClick={() => setShowPickupModal(false)} className="text-slate-400 hover:text-slate-800">
                  ✕
                </button>
              </div>

              <form onSubmit={handleRequestPickup} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pickup Address:</label>
                  {addresses.length > 0 ? (
                    <select
                      value={selectedAddressId}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                    >
                      {addresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label}: {a.street_address}, {a.city}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-slate-500 p-2 bg-slate-100 rounded-xl">
                      Home location will be used.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Time Slot:</label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
                  >
                    <option value="Today 10:00 AM – 12:00 PM">Today 10:00 AM – 12:00 PM</option>
                    <option value="Today 2:00 PM – 4:00 PM">Today 2:00 PM – 4:00 PM (15-Min Fast Dispatch)</option>
                    <option value="Today 5:00 PM – 7:00 PM">Today 5:00 PM – 7:00 PM</option>
                    <option value="Tomorrow Morning (9:00 AM – 12:00 PM)">Tomorrow Morning (9:00 AM – 12:00 PM)</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPickupModal(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPickup}
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isSubmittingPickup ? "Submitting..." : "Confirm & Schedule"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <EcoBotFloating />
      <Footer />
    </div>
  );
}
