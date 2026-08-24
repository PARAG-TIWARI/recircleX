"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SignIn, SignUp, useUser } from "@clerk/nextjs";
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
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { authApi } from "@/lib/api/auth";
import { setUserRole } from "@/app/actions/roles";
import { Roles } from "@/types/globals";

export default function BusinessAuthPage() {
  const router = useRouter();
  const { isSignedIn, user, isLoaded } = useUser();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"RECYCLER" | "ENTERPRISE">("RECYCLER");
  const [authMode, setAuthMode] = useState<"SIGNIN" | "SIGNUP">("SIGNIN");
  const [isSyncing, setIsSyncing] = useState(false);

  const hasRoutedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function handleAuthRouting() {
      if (isLoaded && isSignedIn && user && !hasRoutedRef.current) {
        hasRoutedRef.current = true;
        setIsSyncing(true);
        try {
          // 1. Check existing role in Clerk metadata or use selected role
          const clerkRole = ((user.publicMetadata?.role as string) || selectedRole) as Roles;

          // 2. Set role in Clerk publicMetadata via Server Action
          await setUserRole(clerkRole, "BUSINESS");

          // 3. Sync to MongoDB Atlas
          await authApi.syncUser({
            clerk_user_id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            role: clerkRole,
            portal: "BUSINESS",
            name: user.fullName || user.username || undefined,
            avatar_url: user.imageUrl,
          });

          toast(`Authenticated as ${clerkRole}`, "success");

          // 4. Force browser navigation to role dashboard
          const targetUrl = clerkRole === "ENTERPRISE" ? "/business/enterprise" : "/business/recycler";
          window.location.href = targetUrl;
        } catch (error: any) {
          console.error("Clerk role sync error:", error);
          const targetUrl = selectedRole === "ENTERPRISE" ? "/business/enterprise" : "/business/recycler";
          window.location.href = targetUrl;
        }
      }
    }

    if (isSignedIn && isLoaded && user) {
      handleAuthRouting();
    }
  }, [isLoaded, isSignedIn, user]);

  const clerkAppearance = {
    variables: {
      colorPrimary: "#0F766E",
      colorText: "#111827",
      colorTextSecondary: "#64748B",
      colorBackground: "#FFFFFF",
      colorInputBackground: "#FFFFFF",
      colorInputBorder: "#CBD5E1",
      borderRadius: "0.5rem",
      fontFamily: "Inter, sans-serif",
      fontSize: "0.875rem",
    },
    elements: {
      rootBox: "w-full",
      card: "bg-transparent shadow-none border-none p-0 w-full",
      header: "hidden",
      formButtonPrimary:
        "bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-2xs w-full",
      formFieldRow: "flex gap-4 w-full",
      formField: "flex-1 min-w-0 w-full",
      formFieldLabelRow: "flex justify-between items-center w-full mb-1",
      formFieldInput:
        "rounded-lg border border-slate-300 bg-white text-slate-900 text-xs py-2 px-3 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] shadow-2xs",
      formFieldLabel: "text-xs font-semibold text-slate-700",
      socialButtonsBlockButton:
        "rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 transition-colors shadow-2xs",
      dividerLine: "bg-slate-200",
      dividerText: "text-[11px] text-slate-400 font-semibold uppercase tracking-wider",
      footer: "hidden",
      footerAction: "hidden",
      identityPreviewText: "text-xs font-medium text-slate-700",
      identityPreviewEditButton: "text-xs text-[#0F766E] font-semibold hover:underline",
      formResendCodeLink: "text-xs text-[#0F766E] font-semibold hover:underline",
      otpCodeFieldInput: "border-slate-300 focus:border-[#0F766E] text-slate-900 font-bold rounded-md",
    },
  };

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
                        onClick={() => setSelectedRole("RECYCLER")}
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
                        onClick={() => setSelectedRole("ENTERPRISE")}
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
                  <div className="w-full">
                    {authMode === "SIGNUP" ? (
                      <SignUp
                        routing="hash"
                        signInUrl="#signin"
                        fallbackRedirectUrl="/business/auth"
                        unsafeMetadata={{
                          role: selectedRole,
                          portal: "BUSINESS",
                        }}
                        appearance={clerkAppearance}
                      />
                    ) : (
                      <SignIn
                        routing="hash"
                        signUpUrl="#signup"
                        fallbackRedirectUrl="/business/auth"
                        appearance={clerkAppearance}
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

