"use client";

import Link from "next/link";
import { ArrowRight, Mail, MapPin } from "lucide-react";

const NAV = [
  {
    heading: "Platform",
    links: [
      { label: "Schedule Pickup", href: "/individual/auth" },
      { label: "Collector Workspace", href: "/individual/auth" },
      { label: "B2B Marketplace", href: "/business/auth" },
      { label: "Enterprise ESG Hub", href: "/business/auth" },
      { label: "EcoBot AI Assistant", href: "/individual/household/ecobot" },
    ],
  },
  {
    heading: "Solutions",
    links: [
      { label: "For Households", href: "/individual/auth" },
      { label: "For Collectors", href: "/individual/auth" },
      { label: "For Recyclers", href: "/business/auth" },
      { label: "For Enterprises", href: "/business/auth" },
      { label: "Admin Console", href: "/admin" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Sectors Served", href: "/#sectors" },
      { label: "Material Rate Reference", href: "/" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/" },
      { label: "Terms of Service", href: "/" },
      { label: "Security", href: "/" },
      { label: "Cookie Policy", href: "/" },
    ],
  },
];

export function Footer() {
  return (
    <footer style={{ background: "#0A3D35" }} className="text-white">

      {/* Thin top accent line */}
      <div className="h-[3px]" style={{ background: "linear-gradient(90deg, #0F766E 0%, #4ADE80 50%, #0F766E 100%)" }} />

      {/* Main body */}
      <div className="mx-auto max-w-[90%] px-4 pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Brand + CTA */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="RecircleX"
                className="h-8 w-8 rounded-md object-contain"
                style={{ background: "rgba(255,255,255,0.08)", padding: "4px" }}
              />
              <span className="text-[1.15rem] font-extrabold tracking-tight">
                Recircle<span style={{ color: "#4ADE80" }}>X</span>
              </span>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)", maxWidth: "300px" }}>
              India&apos;s operating system for recycling and raw material trade —
              connecting households, collectors, and industrial recyclers on
              one verified platform.
            </p>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: "#4ADE80" }} />
                <span>BKC Logistics Hub, Mumbai, Maharashtra 400051</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: "#4ADE80" }} />
                <span>operations@recirclex.in</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/individual/auth"
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
                style={{ background: "#0F766E", color: "#fff" }}
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Nav columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {NAV.map((col) => (
              <div key={col.heading} className="space-y-4">
                <h4
                  className="text-[10px] font-bold uppercase tracking-[0.15em]"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {col.heading}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-[13px] hover:text-white transition-colors"
                        style={{ color: "rgba(255,255,255,0.58)" }}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px]"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.28)" }}
        >
          <span>
            © {new Date().getFullYear()} RecircleX Technologies India Pvt. Ltd. All rights reserved.
          </span>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#4ADE80" }} />
            <span>All systems operational</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
