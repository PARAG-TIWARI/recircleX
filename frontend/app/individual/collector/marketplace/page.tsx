"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Plus,
  Package,
  Layers,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Warehouse,
  X,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CollectorNav } from "@/components/collector/collector-nav";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { collectorApi, CollectorInventoryItem } from "@/lib/api/collector";
import { marketplaceApi, MarketplaceListingItem } from "@/lib/api/marketplace";

export default function CollectorMarketplacePage() {
  const { toast } = useToast();

  const [listings, setListings] = useState<MarketplaceListingItem[]>([]);
  const [availableInventory, setAvailableInventory] = useState<CollectorInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedInv, setSelectedInv] = useState<CollectorInventoryItem | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState<number>(32.0);
  const [quality, setQuality] = useState("Standard");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [marketRes, invRes] = await Promise.allSettled([
        marketplaceApi.getListings({ limit: 50, status_filter: "" }), // fetch all statuses
        collectorApi.getInventory(100, 0),
      ]);

      if (marketRes.status === "fulfilled") {
        setListings(marketRes.value.items);
      }
      if (invRes.status === "fulfilled") {
        setAvailableInventory(invRes.value.items.filter((i) => i.status === "AVAILABLE"));
      }
    } catch (e) {
      console.error("Collector marketplace fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = () => {
    if (availableInventory.length === 0) {
      toast("No available inventory to list. Complete pickups first.", "info");
      return;
    }
    const first = availableInventory[0];
    setSelectedInv(first);
    setTitle(`${first.quality || "Standard"} Grade ${first.material}`);
    setDescription(`Clean segregated ${first.material} ready for industrial recycling.`);
    setPricePerUnit(32.0);
    setQuality(first.quality || "Standard");
    setShowModal(true);
  };

  const handleSelectInventory = (item: CollectorInventoryItem) => {
    setSelectedInv(item);
    setTitle(`${item.quality || "Standard"} Grade ${item.material}`);
    setDescription(`Clean segregated ${item.material} ready for industrial recycling.`);
    setQuality(item.quality || "Standard");
  };

  const handleAIEnhance = async () => {
    if (!selectedInv) return;
    setIsEnhancing(true);
    try {
      const res = await marketplaceApi.aiEnhance({
        material: selectedInv.material,
        quantity: selectedInv.quantity,
        unit: selectedInv.unit,
        quality,
        category: selectedInv.category,
      });
      setTitle(res.enhanced_title);
      setDescription(res.technical_description);
      setPricePerUnit(res.suggested_price_per_unit);
      toast("AI generated title, technical description, and suggested pricing!", "success");
    } catch (e: any) {
      toast("AI enhancement fallback applied.", "info");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInv) return;
    setIsSubmitting(true);
    try {
      await marketplaceApi.createListing({
        inventory_id: selectedInv.id,
        title,
        description,
        price_per_unit: pricePerUnit,
        quality,
      });
      setShowModal(false);
      toast("Material lot published to B2B Marketplace!", "success");
      fetchData();
    } catch (e: any) {
      toast(e.message || "Failed to publish listing", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-16 md:pb-0">
      <Navbar />
      <CollectorNav />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              B2B Marketplace Listings
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              List collected scrap batches for industrial recyclers and manage active reservations.
            </p>
          </div>

          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-3 text-xs shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>List Scrap from Inventory</span>
          </button>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading B2B listings...</div>
        ) : listings.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No B2B listings yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                You have {availableInventory.length} collected lots ready in your warehouse inventory.
              </p>
            </div>
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 text-xs shadow-xs transition-colors"
            >
              List First Scrap Lot
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <Layers className="h-8 w-8 text-slate-300" />
                    )}

                    <div className="absolute top-3 right-3">
                      <Badge
                        variant="neutral"
                        className={`text-[9px] py-0 px-2 font-bold ${
                          item.status === "ACTIVE"
                            ? "bg-emerald-600 text-white border-none"
                            : item.status === "RESERVED"
                            ? "bg-amber-500 text-white border-none"
                            : "bg-slate-800 text-white border-none"
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-bold uppercase tracking-wider text-emerald-700 text-[10px]">{item.category}</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>

                    <h3 className="text-sm font-black text-slate-900 line-clamp-1">{item.title}</h3>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Stock Listed</span>
                        <strong className="text-slate-900 font-bold">{item.quantity} {item.unit}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-[10px] block">Wholesale Rate</span>
                        <strong className="text-emerald-600 font-bold">₹{item.price_per_unit}/{item.unit}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Lot Value:</span>
                    <strong className="text-slate-900 font-black">₹{item.total_value}</strong>
                  </div>
                  <Link
                    href={`/business/recycler/marketplace/${item.id}`}
                    className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-3 py-1.5 font-bold text-slate-700"
                  >
                    View in Catalog &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create B2B Listing Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-black text-slate-900 text-base">List Inventory on B2B Marketplace</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-800">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Select Inventory Item */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Warehouse Batch:</label>
                  <select
                    value={selectedInv?.id}
                    onChange={(e) => {
                      const found = availableInventory.find((i) => i.id === e.target.value);
                      if (found) handleSelectInventory(found);
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    required
                  >
                    {availableInventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.material} ({item.quantity} {item.unit}) &bull; Quality: {item.quality}
                      </option>
                    ))}
                  </select>
                </div>

                {/* AI Enhance Trigger */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-50 border border-purple-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <div>
                      <span className="font-bold text-purple-900 block text-xs">AI Listing Enhancement</span>
                      <span className="text-[10px] text-purple-700">Auto-generate commercial specs & pricing</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAIEnhance}
                    disabled={isEnhancing}
                    className="rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold px-3 py-1.5 text-xs shadow-xs transition-colors"
                  >
                    {isEnhancing ? "Enhancing..." : "Enhance with AI"}
                  </button>
                </div>

                {/* Title */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Listing Commercial Title:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Rate & Quality */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contract Rate (₹/kg):</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={pricePerUnit}
                      onChange={(e) => setPricePerUnit(parseFloat(e.target.value) || 1)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-black text-emerald-600 focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Quality Standard:</label>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Grade A">Grade A</option>
                      <option value="Grade B">Grade B</option>
                      <option value="Industrial Clean">Industrial Clean</option>
                      <option value="Standard">Standard</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Technical Description:</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-2.5 shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isSubmitting ? "Publishing..." : "Publish to Marketplace"}</span>
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
