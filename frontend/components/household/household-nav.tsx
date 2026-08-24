"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  PlusCircle,
  Package,
  Truck,
  Leaf,
  Bot,
  User,
  Calendar,
} from "lucide-react";

export function HouseholdNav() {
  const pathname = usePathname();

  const links = [
    { label: "Dashboard", href: "/individual/household", icon: Home },
    { label: "Schedule Pickup", href: "/individual/household/create-listing", icon: Calendar, highlight: true },
    { label: "My Listings", href: "/individual/household/listings", icon: Package },
    { label: "Pickup Requests", href: "/individual/household/pickups", icon: Truck },
    { label: "Carbon Impact", href: "/individual/household/impact", icon: Leaf },
    { label: "EcoBot Assistant", href: "/individual/household/ecobot", icon: Bot },
    { label: "Addresses & Profile", href: "/individual/household/profile", icon: User },
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
              <span className="h-1.5 w-1.5 rounded-full bg-[#0F766E] animate-pulse" />
              <span>Doorstep Pickup Active in Mumbai</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 py-1.5 px-2 shadow-lg">
        <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
          {links
            .filter((l) => ["Dashboard", "Schedule Pickup", "My Listings", "Pickup Requests", "Addresses & Profile"].includes(l.label))
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
                    {link.label === "Schedule Pickup" ? "Pickup" : link.label.replace("Requests", "").replace("Addresses & ", "")}
                  </span>
                </Link>
              );
            })}
        </div>
      </div>
    </>
  );
}
