"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Building2,
  ShieldCheck,
  Save,
  Phone,
  Factory,
  Layers,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RecyclerNav } from "@/components/recycler/recycler-nav";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { recyclerApi, RecyclerProfile } from "@/lib/api/recycler";

export default function RecyclerProfilePage() {
  const { user } = useUser();
  const { toast } = useToast();

  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [capacity, setCapacity] = useState<number>(10.0);
  const [preferredMaterials, setPreferredMaterials] = useState<string>("PET Plastic, OCC Cardboard, Aluminum Cans");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    recyclerApi.getProfile().then((res) => {
      setCompanyName(res.company_name || user?.fullName || "Polymer Recycling Plant");
      setContactPerson(res.contact_person || user?.fullName || "");
      setPhone(res.phone || "");
      setCapacity(res.daily_procurement_capacity_tons || 10.0);
      setPreferredMaterials(res.preferred_materials?.join(", ") || "PET Plastic, OCC Cardboard, Aluminum Cans");
    }).catch(() => {});
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const mats = preferredMaterials.split(",").map((s) => s.trim()).filter(Boolean);
      await recyclerApi.updateProfile({
        company_name: companyName,
        contact_person: contactPerson,
        phone,
        daily_procurement_capacity_tons: capacity,
        preferred_materials: mats,
      });
      toast("Plant profile updated successfully", "success");
    } catch (e: any) {
      toast(e.message || "Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-16 md:pb-0">
      <Navbar />
      <RecyclerNav />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 space-y-8">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center gap-6">
          <div className="h-20 w-20 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-2xl font-black shrink-0 overflow-hidden shadow-sm">
            <Building2 className="h-10 w-10" />
          </div>
          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-slate-900">{companyName || "Industrial Recycling Facility"}</h1>
              <Badge variant="brand" className="text-[10px] bg-emerald-100 text-emerald-800 border-none font-bold">
                Role: RECYCLER
              </Badge>
            </div>
            <p className="text-xs text-slate-500">{user?.primaryEmailAddress?.emailAddress}</p>
            <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified Industrial Processing Plant</span>
              </span>
            </div>
          </div>
        </div>

        {/* Capacity Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Procurement Capacity
            </span>
            <div className="text-2xl font-black text-slate-900">
              {capacity} <span className="text-xs font-bold text-slate-500">Tons / Day</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Input processing limit</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Primary Feedstocks
            </span>
            <div className="text-base font-black text-emerald-700 truncate">
              {preferredMaterials.split(",")[0] || "PET Flakes"}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Focus procurement stream</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Industrial Facility Information</h2>
            <p className="text-xs text-slate-500">
              Suppliers and aggregators will reference these specifications for batch reservation approvals.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Plant Name:</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Procurement Lead / Contact Person:</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Plant Direct Phone:</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98200 12345"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Daily Capacity (Tons):</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={capacity}
                  onChange={(e) => setCapacity(parseFloat(e.target.value) || 1.0)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Preferred Feedstock Materials (Comma-separated):</label>
                <input
                  type="text"
                  value={preferredMaterials}
                  onChange={(e) => setPreferredMaterials(e.target.value)}
                  placeholder="PET Plastic, HDPE, OCC Cardboard, Copper Scrap"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSaving ? "Saving..." : "Save Plant Profile"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
