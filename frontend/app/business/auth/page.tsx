"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SignIn, SignUp, useUser, useAuth } from "@clerk/nextjs";
import {
  ArrowLeft,
  ShieldCheck,
  Building2,
  Factory,
  CheckCircle2,
  FileSpreadsheet,
  Leaf,
  Layers,
  Lock,
  ArrowRight,
  Home,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { authApi } from "@/lib/api/auth";
import { setUserRole } from "@/app/actions/roles";
import { Roles } from "@/types/globals";
import { clerkAppearanceConfig } from "@/lib/clerk-theme";

export default function BusinessAuthPage() {
  const router = useRouter();
  const { isSignedIn, user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"RECYCLER" | "ENTERPRISE">("RECYCLER");
  const [authMode, setAuthMode] = useState<"SIGNIN" | "SIGNUP">("SIGNIN");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const hasRoutedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("recirclex_selected_business_role");
      if (saved === "RECYCLER" || saved === "ENTERPRISE") {
        setSelectedRole(saved);
      }
    }
  }, []);

  const handleRoleSelect = (role: "RECYCLER" | "ENTERPRISE") => {
    setSelectedRole(role);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("recirclex_selected_business_role", role);
    }
  };

  const handleAuthRouting = async () => {
    if (!isLoaded || !isSignedIn || !user || hasRoutedRef.current) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      // Get token directly for reliable backend header injection
      const token = await getToken();

      // Determine target role:
      // 1. Existing Clerk metadata role takes highest precedence (preserves existing users!)
      let clerkRole: Roles | undefined = user.publicMetadata?.role as Roles;

      // 2. Check saved role from sessionStorage (survives Google OAuth redirects)
      const savedRole = typeof window !== "undefined" ? sessionStorage.getItem("recirclex_selected_business_role") : null;
      if (!clerkRole && (savedRole === "RECYCLER" || savedRole === "ENTERPRISE")) {
        clerkRole = savedRole as Roles;
      }

      // 3. Fallback to UI selected role if still unassigned
      if (!clerkRole) {
        clerkRole = selectedRole as Roles;
      }

      // Enforce role boundary (Business portal only accepts RECYCLER or ENTERPRISE)
      if (!["RECYCLER", "ENTERPRISE"].includes(clerkRole)) {
        clerkRole = "RECYCLER";
      }

      // ONLY set/update Clerk publicMetadata if user does not already have this role
      if (user.publicMetadata?.role !== clerkRole) {
        const roleRes = await setUserRole(clerkRole, "BUSINESS");
        if (!roleRes.success) {
          console.warn("setUserRole server action warning:", roleRes.message);
        }
      }

      // Synchronize with MongoDB Atlas backend
      const syncRes = await authApi.syncUser(
        {
          clerk_user_id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          role: clerkRole,
          portal: "BUSINESS",
          name: user.fullName || user.username || undefined,
          avatar_url: user.imageUrl,
        },
        token || undefined
      );

      if (!syncRes.success) {
        throw new Error(syncRes.message || "Failed to synchronize profile with database");
      }

      // Clean up temporary session storage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("recirclex_selected_business_role");
      }

      hasRoutedRef.current = true;
      toast(`Authenticated as ${clerkRole}`, "success");

      // Smooth client-side navigation
      const targetUrl = clerkRole === "ENTERPRISE" ? "/business/enterprise" : "/business/recycler";
      router.replace(targetUrl);
    } catch (error: any) {
      console.error("Clerk role sync error:", error);
      setIsSyncing(false);
      setSyncError(error.message || "Failed to synchronize session with application server.");
      hasRoutedRef.current = false; // Allow user to retry
    }
  };

  useEffect(() => {
    if (isSignedIn && isLoaded && user && !hasRoutedRef.current) {
      handleAuthRouting();
    }
  }, [isLoaded, isSignedIn, user]);


  return (
    <div className="min-h-screen bg-[#F5F7F9] text-slate-900 flex flex-col justify-between">
      {/* Top Corporate Nav Header */}
      <header className="border-b border-slate-200 bg-white px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-2xs">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Public Portal</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-slate-500 font-medium">
              Looking for doorstep household scrap?
            </span>
            <Link
              href="/individual/auth"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
            >
              <Home className="h-3.5 w-3.5 text-[#0F766E]" />
              <span>Switch to Individual Auth</span>
              <ArrowRight className="h-3 w-3 text-slate-400" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container: Two-Column Enterprise Split Screen */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Column: B2B Enterprise Value Props (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200 text-[11px] font-bold text-[#0F766E] uppercase tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>B2B Industrial Exchange</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Commercial Procurement & EPR Governance
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                Connect directly with certified secondary feedstock suppliers, automate multi-plant commercial scrap liquidation, and generate audit-ready CPCB EPR destruction ledgers.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white shadow-2xs">
                <div className="h-8 w-8 rounded-md bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0 mt-0.5">
                  <Factory className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Direct Secondary Mill Sourcing</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Compare certified polymer & metal grades, view weighbridge slips, and reserve wholesale lots with 1-click purchase orders.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white shadow-2xs">
                <div className="h-8 w-8 rounded-md bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0 mt-0.5">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">CPCB EPR Regulatory Audits</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Download tamper-proof electronic recycling certificates mapped directly to mandatory Central Pollution Control Board categories.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white shadow-2xs">
                <div className="h-8 w-8 rounded-md bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0 mt-0.5">
                  <Leaf className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Verified Scope-3 Carbon Offsets</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Real-time conversion factors calculate metric tons of avoided carbon emissions per circular trade.
                  </p>
                </div>
              </div>
            </div>

            {/* Compliance Guarantee */}
            <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1 font-semibold text-slate-700">
                <Lock className="h-3.5 w-3.5 text-[#0F766E]" />
                <span>GST & Enterprise Compliant</span>
              </div>
              <span>&bull;</span>
              <span>CPCB Registered Recycler</span>
              <span>&bull;</span>
              <span>ISO 14001</span>
            </div>
          </div>

          {/* Right Column: Clean Operational Auth Card (7 Cols) */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm overflow-hidden">
              
              {/* Header Title */}
              <div className="text-center pb-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">
                  {authMode === "SIGNIN" ? "Sign In to Business Portal" : "Create Enterprise Account"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Access industrial scrap procurement, orders, and ESG compliance.
                </p>

                {/* Role Switcher Pills */}
                {!isSignedIn && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 text-left">
                      Select Corporate Classification:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleRoleSelect("RECYCLER")}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                          selectedRole === "RECYCLER"
                            ? "border-[#0F766E] bg-teal-50/70 text-[#0F766E] ring-1 ring-[#0F766E]"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Factory className="h-4 w-4 shrink-0" />
                        <div>
                          <span className="block text-xs font-bold leading-none">Recycling Mill</span>
                          <span className="block text-[10px] text-slate-500 mt-0.5">Feedstock Buyer</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRoleSelect("ENTERPRISE")}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                          selectedRole === "ENTERPRISE"
                            ? "border-[#0F766E] bg-teal-50/70 text-[#0F766E] ring-1 ring-[#0F766E]"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Building2 className="h-4 w-4 shrink-0" />
                        <div>
                          <span className="block text-xs font-bold leading-none">Enterprise / Brand</span>
                          <span className="block text-[10px] text-slate-500 mt-0.5">EPR & Waste OS</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mode Toggle Switch (Sign In vs Sign Up) */}
              <div className="my-5 flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setAuthMode("SIGNIN")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                    authMode === "SIGNIN"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("SIGNUP")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                    authMode === "SIGNUP"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Sign Up (New Business)
                </button>
              </div>

              {/* Error Banner */}
              {syncError && (
                <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">Synchronization Error</p>
                    <p className="text-[11px] mt-0.5 leading-snug">{syncError}</p>
                    <button
                      type="button"
                      onClick={() => handleAuthRouting()}
                      className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600 text-white font-semibold text-[11px] hover:bg-red-700 transition-colors"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Retry Synchronization
                    </button>
                  </div>
                </div>
              )}

              {/* Clerk Form Embed Area */}
              <div className="w-full">
                {!mounted ? (
                  <div className="py-12 text-center">
                    <div className="h-6 w-6 rounded-full border-2 border-[#0F766E] border-t-transparent animate-spin mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Loading secure business portal...</p>
                  </div>
                ) : isSyncing ? (
                  <div className="py-12 text-center space-y-2">
                    <div className="h-8 w-8 rounded-full border-2 border-[#0F766E] border-t-transparent animate-spin mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-900">Synchronizing your {selectedRole} plant...</p>
                    <p className="text-xs text-slate-500">Connecting to B2B exchange</p>
                  </div>
                ) : (
                  <div className="w-full max-w-full box-border">
                    {authMode === "SIGNUP" ? (
                      <SignUp
                        routing="hash"
                        signInUrl="#signin"
                        fallbackRedirectUrl="/business/auth"
                        unsafeMetadata={{
                          role: selectedRole,
                          portal: "BUSINESS",
                        }}
                        appearance={clerkAppearanceConfig}
                      />
                    ) : (
                      <SignIn
                        routing="hash"
                        signUpUrl="#signup"
                        fallbackRedirectUrl="/business/auth"
                        appearance={clerkAppearanceConfig}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Footer Trust Bar */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#0F766E]" />
                  CPCB Certified Secondary Network
                </span>
                <span>Clerk RBAC Protected</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-3.5 text-center text-xs text-slate-500 bg-white">
        RecircleX B2B Exchange &bull; Industrial Procurement & Corporate EPR Compliance
      </footer>
    </div>
  );
}

