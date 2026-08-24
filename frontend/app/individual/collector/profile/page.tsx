"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  User,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Phone,
  Truck,
  Star,
  Award,
  Save,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CollectorNav } from "@/components/collector/collector-nav";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { collectorApi, CollectorProfile } from "@/lib/api/collector";

export default function CollectorProfilePage() {
  const { user } = useUser();
  const { toast } = useToast();

  const [profile, setProfile] = useState<CollectorProfile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceArea, setServiceArea] = useState("Metro Zone 1");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    collectorApi.getProfile().then((res) => {
      setProfile(res);
      setName(res.name || user?.fullName || "");
      setPhone(res.phone || "");
      setServiceArea(res.service_area || "Metro Zone 1");
    }).catch(() => { });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await collectorApi.updateProfile({
        name,
        phone,
        service_area: serviceArea,
      });
      setProfile(updated);
      toast("Collector profile updated successfully", "success");
    } catch (e: any) {
      toast(e.message || "Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-16 md:pb-0">
      <Navbar />
      <CollectorNav />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 space-y-8">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center gap-6">
          <div className="h-20 w-20 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-black shrink-0 overflow-hidden shadow-sm">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <User className="h-10 w-10" />
            )}
          </div>
          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-slate-900">
                {profile?.name || user?.fullName || "Collection Partner"}
              </h1>
              <Badge variant="brand" className="text-[10px] bg-blue-100 text-blue-800 border-none">
                Role: COLLECTOR
              </Badge>
            </div>
            <p className="text-xs text-slate-500">{user?.primaryEmailAddress?.emailAddress}</p>

            {/* Verification Status Pill (Strict Database Check) */}
            <div className="pt-1.5 flex items-center justify-center sm:justify-start gap-2">
              {profile?.is_verified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verified Collection Partner</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                  <span>Standard Collection Partner (KYC Pending)</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Collector Performance Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Field Rating
            </span>
            <div className="flex items-center justify-center gap-1 text-2xl font-black text-slate-900">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              <span>{profile?.rating || 4.9}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Household score</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Pickups
            </span>
            <div className="text-2xl font-black text-emerald-600">
              {profile?.total_pickups || 0}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Completed intakes</p>
          </div>

          <div className="col-span-2 sm:col-span-1 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Service Zone
            </span>
            <div className="text-lg font-black text-slate-900 truncate">
              {profile?.service_area || "Metro Zone 1"}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Assigned sector</p>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Collector Dispatch & Contact Information</h2>
            <p className="text-xs text-slate-500">
              Households and central logistics rely on these details for dispatch routing.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Partner Display Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dispatch Phone Number:</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Operating Service Sector:</label>
                <input
                  type="text"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="e.g. Metro Zone 1 (Andheri / Bandra)"
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
                <span>{isSaving ? "Saving..." : "Save Collector Profile"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
