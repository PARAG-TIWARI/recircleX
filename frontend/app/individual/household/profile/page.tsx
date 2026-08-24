"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  User,
  MapPin,
  Plus,
  CheckCircle2,
  Phone,
  Mail,
  ShieldCheck,
  Building,
  Save,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HouseholdNav } from "@/components/household/household-nav";
import { EcoBotFloating } from "@/components/household/ecobot-floating";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { profilesApi, ProfileData } from "@/lib/api/profiles";
import { addressesApi, AddressItem, CreateAddressPayload } from "@/lib/api/addresses";

export default function HouseholdProfilePage() {
  const { user } = useUser();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // New Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState<CreateAddressPayload>({
    label: "Home",
    street_address: "",
    city: "Mumbai",
    state: "Maharashtra",
    postal_code: "",
    landmark: "",
    contact_phone: "",
    is_default: true,
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  useEffect(() => {
    profilesApi.getMyProfile().then((res) => {
      setProfile(res);
      setPhone(res.phone || "");
      setBio(res.bio || "");
    }).catch(() => { });

    addressesApi.getAddresses().then((res) => {
      setAddresses(res);
    }).catch(() => { });
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const updated = await profilesApi.updateMyProfile({
        phone: phone || undefined,
        bio: bio || undefined,
      });
      setProfile(updated);
      toast("Profile updated successfully", "success");
    } catch (e: any) {
      toast(e.message || "Failed to update profile", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.street_address || !newAddr.postal_code) {
      toast("Please fill in address and postal code", "error");
      return;
    }

    setIsSavingAddress(true);
    try {
      const created = await addressesApi.createAddress(newAddr);
      setAddresses((prev) => [...prev, created]);
      setShowAddressForm(false);
      setNewAddr({
        label: "Home",
        street_address: "",
        city: "Mumbai",
        state: "Maharashtra",
        postal_code: "",
        landmark: "",
        contact_phone: "",
        is_default: false,
      });
      toast("Address saved", "success");
    } catch (e: any) {
      toast(e.message || "Failed to save address", "error");
    } finally {
      setIsSavingAddress(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-16 md:pb-0">
      <Navbar />
      <HouseholdNav />

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
                {user?.fullName || user?.username || "Household User"}
              </h1>
              <Badge variant="brand" className="text-[10px] bg-emerald-100 text-emerald-800 border-none">
                Role: HOUSEHOLD
              </Badge>
            </div>
            <p className="text-xs text-slate-500">{user?.primaryEmailAddress?.emailAddress}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-[11px] text-emerald-700 font-semibold pt-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Clerk Authenticated & MongoDB Synced</span>
            </div>
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Contact & Preferred Pickup Info</h2>
            <p className="text-xs text-slate-500">Collectors will contact you on this phone number for doorstep intake.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone Number:</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email (Clerk Primary):</label>
                <input
                  type="email"
                  value={user?.primaryEmailAddress?.emailAddress || ""}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Pickup Notes / Instructions:</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Ring bell 402, collection partner can access lift"
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSavingProfile ? "Saving..." : "Save Preferences"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Saved Addresses Section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Saved Addresses</h2>
              <p className="text-xs text-slate-500">Manage pickup locations for quick scrap scheduling.</p>
            </div>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-800 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{showAddressForm ? "Cancel" : "Add Address"}</span>
            </button>
          </div>

          {/* Add Address Form */}
          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Label:</label>
                  <input
                    type="text"
                    value={newAddr.label}
                    onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                    placeholder="Home, Office, Flat"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PIN / Postal Code:</label>
                  <input
                    type="text"
                    value={newAddr.postal_code}
                    onChange={(e) => setNewAddr({ ...newAddr, postal_code: e.target.value })}
                    placeholder="400001"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Street Address / Building:</label>
                  <input
                    type="text"
                    value={newAddr.street_address}
                    onChange={(e) => setNewAddr({ ...newAddr, street_address: e.target.value })}
                    placeholder="402, Green Valley Apartments, MG Road"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City:</label>
                  <input
                    type="text"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Landmark (Optional):</label>
                  <input
                    type="text"
                    value={newAddr.landmark || ""}
                    onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                    placeholder="Near Metro Station"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-xs shadow-xs"
                >
                  {isSavingAddress ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          )}

          {/* List of saved addresses */}
          {addresses.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              No saved addresses yet. Click &quot;Add Address&quot; to save your home location.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {addresses.map((a) => (
                <div key={a.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900">{a.label}</span>
                    {a.is_default && (
                      <Badge variant="brand" className="text-[9px] bg-emerald-100 text-emerald-800 border-none">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-700 font-medium">{a.street_address}</p>
                  <p className="text-slate-500">{a.city}, {a.state} - {a.postal_code}</p>
                  {a.landmark && <p className="text-[11px] text-slate-400">Landmark: {a.landmark}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <EcoBotFloating />
      <Footer />
    </div>
  );
}
