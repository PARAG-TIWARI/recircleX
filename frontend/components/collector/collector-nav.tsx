"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  MapPin,
  Warehouse,
  ShoppingBag,
  ClipboardList,
  User,
  ShieldCheck,
} from "lucide-react";

export function CollectorNav() {
  const pathname = usePathname();

  const links = [
    { label: "Dashboard", href: "/individual/collector", icon: LayoutDashboard },
    { label: "Job Queue", href: "/individual/collector/pickups", icon: Truck, highlight: true },
    { label: "GPS Dispatch Map", href: "/individual/collector/map", icon: MapPin },
    { label: "Warehouse Inventory", href: "/individual/collector/inventory", icon: Warehouse },
    { label: "B2B Marketplace Lots", href: "/individual/collector/marketplace", icon: ShoppingBag },
    { label: "Intake Receipts", href: "/individual/collector/orders", icon: ClipboardList },
    { label: "Profile & Depot", href: "/individual/collector/profile", icon: User },
  ];

  return (
    <>
      {/* Desktop Sub-Nav Header */}
      <div className="hidden md:block w-full border-b border-slate-200 bg-white sticky top-16 z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
              {links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                      link.highlight
                        ? isActive
                          ? "bg-[#0F766E] text-white"
                          : "bg-[#0F766E] text-white hover:bg-[#115E59]"
                        : isActive
                        ? "bg-teal-50 text-[#0F766E] border border-teal-200"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs text-[#0F766E] font-medium bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md">
              <ShieldCheck className="h-3.5 w-3.5 text-[#0F766E]" />
              <span>Authorized Depot Logistics Unit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 py-1.5 px-2 shadow-lg">
        <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
          {links
            .filter((l) => ["Dashboard", "Job Queue", "GPS Dispatch Map", "Warehouse Inventory", "Profile & Depot"].includes(l.label))
            .map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex flex-col items-center justify-center py-1 rounded-md transition-colors ${
                    isActive ? "text-[#0F766E] font-bold" : "text-slate-500 font-medium"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
                    {link.label.replace(" & Depot", "").replace("GPS Dispatch ", "").replace("Warehouse ", "")}
                  </span>
                </Link>
              );
            })}
        </div>
      </div>
    </>
  );
}
