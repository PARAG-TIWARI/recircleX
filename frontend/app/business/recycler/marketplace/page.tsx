"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Filter,
  Layers,
  MapPin,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Tag,
  Package,
  Calendar,
  CheckCircle2,
  Scale,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RecyclerNav } from "@/components/recycler/recycler-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { marketplaceApi, MarketplaceListingItem } from "@/lib/api/marketplace";

export default function MarketplaceCatalogPage() {
  const { toast } = useToast();

  const [listings, setListings] = useState<MarketplaceListingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [category, setCategory] = useState<string>("All");
  const [quality, setQuality] = useState<string>("All");
  const [search, setSearch] = useState<string>("" );
  const [sortBy, setSortBy] = useState<string>("newest");

  // Fast Reservation Modal State
  const [selectedListing, setSelectedListing] = useState<MarketplaceListingItem | null>(null);
  const [reserveNotes, setReserveNotes] = useState("");
  const [isReserving, setIsReserving] = useState(false);

  const categories = ["All", "Plastic", "Paper", "Metal", "E-Waste", "Glass"];
  const qualityGrades = ["All", "Grade A", "Grade B", "Industrial Clean", "Standard"];

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const res = await marketplaceApi.getListings({
        category: category !== "All" ? category : undefined,
        quality: quality !== "All" ? quality : undefined,
        search: search.trim() || undefined,
        sort_by: sortBy !== "newest" ? sortBy : undefined,
        status_filter: "ACTIVE",
        limit: 50,
      });
      setListings(res.items);
    } catch (e) {
      console.error("Marketplace fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, quality, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  const handleConfirmReservation = async () => {
    if (!selectedListing) return;
    setIsReserving(true);
    try {
      const order = await marketplaceApi.reserveListing(selectedListing.id, {
        notes: reserveNotes || "Dispatched to plant intake bay.",
      });
      toast("Lot reserved! B2B Contract Order generated successfully.", "success");
      setSelectedListing(null);
      setReserveNotes("");
      fetchListings();
    } catch (e: any) {
      toast(e.message || "Failed to reserve lot", "error");
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F9] text-slate-900 flex flex-col justify-between">
      <Navbar />
      <RecyclerNav />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: "Recycler Procurement", href: "/business/recycler" },
            { label: "B2B Scrap Catalog" },
          ]}
          title="B2B Recyclable Feedstock Exchange"
          description="Source segregated scrap lots directly from verified collection depots. Compare polymer/alloy grades, inspect certified quantities, and reserve batches with 1 click."
          action={
            <Link href="/business/recycler/orders">
              <Button variant="secondary" size="default" leftIcon={<Package className="h-4 w-4" />}>
                View Active Orders
              </Button>
            </Link>
          }
        />

        {/* Filter Controls Bar (IndiaMART style) */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search material e.g. PET, Copper, OCC..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs rounded-md border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:border-[#0F766E]"
              />
            </form>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 px-3 rounded-md border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#0F766E]"
              >
                <option value="newest">Recently Listed</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="quantity_desc">Highest Quantity</option>
              </select>
            </div>
          </div>

          {/* Category Quick Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  category === cat
                    ? "bg-[#0F766E] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dense Material Procurement Catalog Grid (IndiaMART style) */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            Loading verified marketplace lots...
          </div>
        ) : listings.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-xs text-slate-400">
              No recyclable material lots matching the selected filter criteria.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((lot) => {
              const totalLotValue = Math.round(lot.quantity * lot.price_per_unit);
              return (
                <div
                  key={lot.id}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-2xs hover:border-teal-500 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="info">{lot.category}</Badge>
                          <Badge variant="outline">{lot.quality}</Badge>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                          {lot.title}
                        </h3>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400 font-bold shrink-0">
                        #{lot.id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                          Rate / kg
                        </span>
                        <span className="text-base font-bold text-[#0F766E]">
                          ₹{lot.price_per_unit} <span className="text-xs font-normal text-slate-500">/ {lot.unit}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                          Available Lot
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {lot.quantity} {lot.unit}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {lot.location?.city || "Mumbai Depot Zone 1"}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-teal-800">
                          <ShieldCheck className="h-3.5 w-3.5 text-[#0F766E]" />
                          Verified Depot
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-medium text-slate-700 pt-1">
                        <span>Total Lot Value:</span>
                        <span className="font-bold text-slate-900">₹{totalLotValue.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/business/recycler/marketplace/${lot.id}`}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline"
                    >
                      Inspect Specs &rarr;
                    </Link>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedListing(lot)}
                    >
                      Reserve Lot
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 1-Click Fast Reservation Modal (Direct contract issuance) */}
        {selectedListing && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedListing(null)}
            title="Reserve Recyclable Material Lot"
            description={`Generate binding procurement order for #${selectedListing.id.slice(-6).toUpperCase()}`}
            maxWidth="md"
          >
            <div className="space-y-4 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{selectedListing.title}</span>
                  <Badge variant="success">Active Supply</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Quantity:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedListing.quantity} {selectedListing.unit} ({selectedListing.quality})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Price Rate:</span>
                    <span className="font-semibold text-slate-800">
                      ₹{selectedListing.price_per_unit} / {selectedListing.unit}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-700">Total Purchase Order:</span>
                  <span className="font-bold text-base text-[#0F766E]">
                    ₹{Math.round(selectedListing.quantity * selectedListing.price_per_unit).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Plant Delivery & Gate Intake Instructions
                </label>
                <textarea
                  rows={2}
                  value={reserveNotes}
                  onChange={(e) => setReserveNotes(e.target.value)}
                  placeholder="e.g. Delivery to Smelting Bay 2. Weighbridge slip required on gate entry."
                  className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="p-2.5 rounded-md border border-teal-200 bg-teal-50 text-teal-800 text-[11px] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#0F766E] shrink-0" />
                <span>
                  Reserving locks this lot exclusively for your plant and generates an electronic B2B contract order.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setSelectedListing(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="default"
                  isLoading={isReserving}
                  onClick={handleConfirmReservation}
                >
                  Confirm & Issue Purchase Order
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </main>

      <Footer />
    </div>
  );
}
