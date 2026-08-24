"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Package,
  Truck,
  Layers,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  Trash2,
  X,
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

export default function MyListingsPage() {
  const { toast } = useToast();
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pickup Request Modal State
  const [selectedListing, setSelectedListing] = useState<ListingItem | null>(null);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [preferredTime, setPreferredTime] = useState<string>("Today 2:00 PM – 4:00 PM");
  const [notes, setNotes] = useState<string>("");
  const [isSubmittingPickup, setIsSubmittingPickup] = useState(false);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const res = await listingsApi.getMyListings(50, 0);
      setListings(res.items);
    } catch (e) {
      console.error("Fetch listings error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    addressesApi.getAddresses().then((res) => {
      setAddresses(res);
      if (res.length > 0) {
        const defaultAddr = res.find((a) => a.is_default) || res[0];
        setSelectedAddressId(defaultAddr.id);
      }
    }).catch(() => {});
  }, []);

  const handleOpenPickupModal = (listing: ListingItem) => {
    setSelectedListing(listing);
  };

  const handleRequestPickupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;

    setIsSubmittingPickup(true);
    try {
      await pickupsApi.createPickup({
        listing_id: selectedListing.id,
        address_id: selectedAddressId || undefined,
        preferred_time: preferredTime,
        notes: notes || undefined,
      });

      toast("Pickup requested! A collection partner will be assigned shortly.", "success");
      setSelectedListing(null);
      fetchListings();
    } catch (err: any) {
      toast(err.message || "Failed to request pickup", "error");
    } finally {
      setIsSubmittingPickup(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await listingsApi.deleteListing(id);
      toast("Listing removed", "info");
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (e: any) {
      toast(e.message || "Could not delete listing", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-16 md:pb-0">
      <Navbar />
      <HouseholdNav />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Waste Listings
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your published recyclable items and request doorstep collection pickups.
            </p>
          </div>

          <Link
            href="/individual/household/create-listing"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 text-xs shadow-sm transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>List More Waste</span>
          </Link>
        </div>

        {/* Listings Content */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading your listings...</div>
        ) : listings.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Package className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No waste listings found</h3>
              <p className="text-xs text-slate-500 mt-1">
                You haven&apos;t listed any scrap yet. Upload a photo to identify your material and earn cash.
              </p>
            </div>
            <Link
              href="/individual/household/create-listing"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 text-xs shadow-md transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Your First Listing</span>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image / Thumbnail */}
                  <div className="h-44 w-full bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center gap-1 text-xs">
                        <Layers className="h-8 w-8 text-slate-300" />
                        <span>No image provided</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant="neutral"
                        className={`text-[10px] py-0.5 px-2 font-bold shadow-xs ${
                          item.status === "AVAILABLE"
                            ? "bg-emerald-600 text-white border-none"
                            : item.status === "PICKUP_REQUESTED"
                            ? "bg-blue-600 text-white border-none"
                            : "bg-slate-700 text-white border-none"
                        }`}
                      >
                        {item.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-bold text-emerald-700 uppercase tracking-wider text-[10px]">
                        {item.category}
                      </span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description || `Clean household ${item.material} for recycling.`}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-500 text-[11px]">Quantity</span>
                        <p className="font-black text-slate-900">{item.quantity} {item.unit}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 text-[11px]">Estimated Value</span>
                        <p className="font-black text-emerald-600 text-sm">
                          {item.estimated_price_range || `₹${item.estimated_price || 0}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  {item.status === "AVAILABLE" ? (
                    <button
                      onClick={() => handleOpenPickupModal(item)}
                      className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Truck className="h-3.5 w-3.5" />
                      <span>Request Pickup</span>
                    </button>
                  ) : (
                    <Link
                      href="/individual/household/pickups"
                      className="flex-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2.5 text-xs text-center transition-colors"
                    >
                      Track Pickup &rarr;
                    </Link>
                  )}

                  {item.status === "AVAILABLE" && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded-xl border border-slate-200 p-2.5 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                      title="Delete listing"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pickup Request Modal */}
        {selectedListing && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-black text-slate-900 text-base">Request Doorstep Pickup</h3>
                </div>
                <button
                  onClick={() => setSelectedListing(null)}
                  className="rounded-full p-1 text-slate-400 hover:text-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Item Snapshot */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{selectedListing.title}</p>
                  <p className="text-emerald-800 font-semibold">{selectedListing.quantity} {selectedListing.unit} &bull; {selectedListing.estimated_price_range || `₹${selectedListing.estimated_price}`}</p>
                </div>
                <Badge variant="brand" className="text-[10px] bg-emerald-200 text-emerald-900 border-none">
                  Scale Verified
                </Badge>
              </div>

              <form onSubmit={handleRequestPickupSubmit} className="space-y-4 text-xs">
                {/* Select Address */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pickup Address:
                  </label>
                  {addresses.length > 0 ? (
                    <select
                      value={selectedAddressId}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:border-emerald-500 focus:outline-none"
                    >
                      {addresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label}: {a.street_address}, {a.city} ({a.postal_code})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-slate-500 text-[11px] p-2 bg-slate-100 rounded-xl">
                      Default location ({selectedListing.location?.street || "Home address"}) will be used.
                    </p>
                  )}
                </div>

                {/* Preferred Time Slot */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Preferred Time Slot:
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Today 10:00 AM – 12:00 PM">Today 10:00 AM – 12:00 PM</option>
                    <option value="Today 2:00 PM – 4:00 PM">Today 2:00 PM – 4:00 PM (15-Min Fast Dispatch)</option>
                    <option value="Today 5:00 PM – 7:00 PM">Today 5:00 PM – 7:00 PM</option>
                    <option value="Tomorrow Morning (9:00 AM – 12:00 PM)">Tomorrow Morning (9:00 AM – 12:00 PM)</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Special Instructions (Optional):
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Ring bell 402, scrap kept in corridor box"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedListing(null)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPickup}
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-2.5 shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isSubmittingPickup ? "Scheduling..." : "Confirm & Request Pickup"}</span>
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
