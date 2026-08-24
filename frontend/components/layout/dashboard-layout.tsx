"use client";

import React from "react";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  Recycle,
  LayoutDashboard,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface DashboardLayoutProps {
  roleTitle: string;
  roleSubtitle: string;
  roleCode: "HOUSEHOLD" | "COLLECTOR" | "RECYCLER" | "ENTERPRISE" | "ADMIN";
  upcomingModules: {
    title: string;
    description: string;
    phase: string;
  }[];
  children?: React.ReactNode;
}

export function DashboardLayout({
  roleTitle,
  roleSubtitle,
  roleCode,
  upcomingModules,
  children,
}: DashboardLayoutProps) {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="RecycleX Logo" className="h-8 w-8 rounded-lg object-contain" />
              <span className="font-bold text-slate-900 tracking-tight">RecycleX</span>
            </Link>
            <span className="text-slate-300">/</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">{roleTitle}</span>
              <StatusBadge status={roleCode} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs text-slate-500 font-medium">
              {user?.primaryEmailAddress?.emailAddress || user?.fullName}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Workspace Banner */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="text-xs py-0.5 bg-emerald-100 text-emerald-800 border-none">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Role Verified & Database Synced
                </Badge>
                <span className="text-xs text-slate-500">Part 0 Shared Foundation</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {roleTitle}
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                {roleSubtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-slate-900">Your workspace is active.</p>
                  <p className="text-slate-500 text-[11px]">Clerk RBAC authenticated</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Role Workspace Content */}
        {children && <div className="mb-10">{children}</div>}

        {/* Coming Next Module Section */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Part 1 & 2 Workflow Modules
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Role-specific transactional features activating in sequential parts.
              </p>
            </div>
            <Badge variant="neutral" className="text-xs bg-slate-100 text-slate-700">
              <Clock className="h-3 w-3" />
              Ready for Part 1
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingModules.map((mod, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all group"
              >
                <div className="flex items-center justify-between text-xs text-emerald-700 font-bold mb-2">
                  <span>{mod.phase}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors mb-1.5">
                  {mod.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {mod.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        RecycleX Platform &bull; Role Workspace: {roleCode} &bull; Shared Foundation v1.0
      </footer>
    </div>
  );
}
