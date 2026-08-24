"use client";

import Link from "next/link";
import {
  Recycle,
  Truck,
  Building2,
  Factory,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  Scale,
  Award,
  CheckCircle2,
  Layers,
  FileText,
  Cpu,
  Wine,
  BatteryCharging,
  Home,
  Package,
  Search,
  ChevronRight,
  Leaf,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const commodityRates = [
    {
      category: "Plastics & Polymers",
      spec: "PET Flakes, HDPE Drums, LDPE Film, PP Granules",
      benchmarkRate: "â‚¹34 â€“ â‚¹48 / kg",
      trend: "+2.4%",
      isPositive: true,
      icon: Layers,
    },
    {
      category: "Metals & Non-Ferrous Alloys",
      spec: "Copper Wire, Aluminium Extrusion, Brass, Mild Steel",
      benchmarkRate: "â‚¹38 â€“ â‚¹740 / kg",
      trend: "+1.1%",
      isPositive: true,
      icon: Layers,
    },
    {
      category: "Corrugated Paper & Kraft",
      spec: "OCC Grade 11, Sorted White Office Paper, Duplex Board",
      benchmarkRate: "â‚¹14 â€“ â‚¹22 / kg",
      trend: "-0.5%",
      isPositive: false,
      icon: FileText,
    },
    {
      category: "Electronic Waste & PCBs",
      spec: "Telecom PCBs, Server Motherboards, Lithium-Ion Cells",
      benchmarkRate: "â‚¹85 â€“ â‚¹450 / kg",
      trend: "+3.8%",
      isPositive: true,
      icon: Cpu,
    },
    {
      category: "Industrial Lead-Acid Batteries",
      spec: "UPS Battery Scrap, Automotive Sealed Lead Units",
      benchmarkRate: "â‚¹92 â€“ â‚¹115 / kg",
      trend: "+0.8%",
      isPositive: true,
      icon: BatteryCharging,
    },
    {
      category: "Cullet & Glass Bottles",
      spec: "Flint Glass, Amber Beverage Bottles, Broken Cullet",
      benchmarkRate: "â‚¹4 â€“ â‚¹8 / kg",
      trend: "0.0%",
      isPositive: true,
      icon: Wine,
    },
  ];

  const solutions = [
    {
      role: "For Households & Societies",
      tagline: "Doorstep scrap collection with digital scale verification",
      description:
        "Book pickups on your schedule. Certified collection partners weigh material at your doorstep and initiate instant digital payments.",
      link: "/individual/auth",
      linkText: "Book Household Pickup",
      icon: Home,
      features: [
        "Certified digital scale weighing at doorstep",
        "Instant UPI & bank account payout",
        "Transparent real-time market scrap pricing",
      ],
    },
    {
      role: "For Collection Partners",
      tagline: "Daily route dispatch and direct warehouse inventory",
      description:
        "Accept pickup requests in your territory, optimize navigation routes, build inventory lots, and sell directly to certified recycling mills.",
      link: "/individual/auth",
      linkText: "Join Collection Network",
      icon: Truck,
      features: [
        "Territory-based pickup job queue",
        "Digital intake weighing with customer receipts",
        "Automated warehouse lot cataloging & B2B listing",
      ],
    },
    {
      role: "For Industrial Recyclers",
      tagline: "Verified secondary raw material procurement portal",
      description:
        "Source segregated scrap lots directly from verified aggregators. Compare grades, reserve feedstock batches, and track transit manifests.",
      link: "/business/auth",
      linkText: "Source Recyclable Materials",
      icon: Factory,
      features: [
        "IndiaMART-style material lot search & grade filtering",
        "1-Click feedstock reservation & contract issuance",
        "Weighbridge slip and material purity audit trails",
      ],
    },
    {
      role: "For Commercial Enterprises",
      tagline: "Multi-facility waste management & CPCB EPR compliance",
      description:
        "Schedule commercial scrap dispatches across factories, monitor Scope-3 carbon reductions, and download auditable digital EPR certificates.",
      link: "/business/auth",
      linkText: "Enterprise Waste Solutions",
      icon: Building2,
      features: [
        "Centralized multi-plant collection schedules",
        "ISO 14001 & Scope-3 avoided carbon reporting",
        "CPCB registered auditable recycling receipts",
      ],
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Schedule & Route",
      desc: "Household or facility requests scrap pickup; nearest certified collection partner is dispatched with calibrated equipment.",
    },
    {
      num: "02",
      title: "Digital Scale Weighing",
      desc: "Scrap is sorted and weighed on-site with IoT-calibrated digital scales; instant settlement is issued.",
    },
    {
      num: "03",
      title: "Depot Aggregation",
      desc: "Collected materials are graded, compacted, and cataloged into tradeable commodity inventory lots.",
    },
    {
      num: "04",
      title: "Industrial Circular Feedstock",
      desc: "Registered recycling mills procure reserved lots with complete traceability, weighbridge manifests, and EPR data.",
    },
  ];

  const faqs = [
    {
      q: "How does doorstep scale verification work?",
      a: "Our collection partners carry certified digital hanging scales. Weight is recorded and agreed upon at pickup, automatically generating an electronic receipt and instantaneous UPI payout.",
    },
    {
      q: "How do industrial recyclers buy materials on the marketplace?",
      a: "Certified recycling mills can filter lots by polymer/alloy grade, quantity, and warehouse location. Lots can be reserved with 1 click to generate a binding procurement order and dispatch manifest.",
    },
    {
      q: "How does RecircleX assist with corporate EPR & ESG reporting?",
      a: "Every transaction generates an auditable chain of custody aligned with CPCB guidelines, providing Scope-3 greenhouse gas avoidance calculations and verified destruction certificates.",
    },
    {
      q: "What is the minimum quantity for scrap collection?",
      a: "Households can request pickups starting at 5 kg of mixed recyclables. For enterprise facilities, bulk dispatch orders can handle metric-tonne container loads.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7F9] text-slate-900 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white border-b border-slate-200 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              {/* Left Copy */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-md bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-semibold text-[#0F766E]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  National Circular Operations & Material Trade Network
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  India&apos;s Operating System for Recycling &{" "}
                  <span className="text-[#0F766E]">Raw Material Trade</span>
                </h1>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                  RecircleX connects households, collection partners, logistics fleets, and industrial
                  recycling mills on a single digital platform â€” streamlining doorstep pickups, enabling
                  transparent B2B commodity trading, and ensuring ESG compliance.
                </p>

                {/* Primary Dual Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link href="/individual/auth">
                    <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      Schedule Doorstep Pickup
                    </Button>
                  </Link>

                  <Link href="/business/auth">
                    <Button variant="secondary" size="lg" leftIcon={<Factory className="h-4 w-4 text-slate-600" />}>
                      Source Raw Materials
                    </Button>
                  </Link>
                </div>

                                {/* Platform Capabilities â€” no fake numbers */}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
                    Doorstep pickup scheduling
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
                    B2B material marketplace
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
                    ESG & EPR compliance tools
                  </div>
                </div>
              </div>

              {/* Right Operational Imagery */}
              <div className="lg:col-span-5">
                <div className="rounded-lg border border-slate-200 overflow-hidden shadow-card bg-slate-50">
                  <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span>Certified Recycling Plant Operations</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">ISO 14001 Verified</span>
                  </div>
                  <div className="p-1 bg-slate-100">
                    <img
                      src="/recycling-facility.jpg"
                      alt="Industrial Recycling Facility and Segregation Warehouse"
                      className="w-full h-72 sm:h-80 object-cover rounded-sm"
                      onError={(e) => {
                        // Fallback image URL if local asset is missing
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                  </div>
                  <div className="p-4 bg-white border-t border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Digital Chain of Custody</span>
                      <Badge variant="success">Active Dispatch Hub</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Every kilogram collected from citizens is digitally tracked from doorstep scale intake
                      through to industrial mill remanufacturing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Scrap Commodity Price Index (IndiaMART style) */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-bold text-[#0F766E] uppercase tracking-wider mb-1">
                Real-Time Benchmark Exchange
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Daily Recyclable Commodity Rates
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Indicative procurement rates updated daily across registered industrial recycling mills.
              </p>
            </div>
            <Link href="/business/auth">
              <Button variant="outline" size="sm" rightIcon={<ChevronRight className="h-3.5 w-3.5" />}>
                View All Marketplace Lots
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commodityRates.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs hover:border-teal-500 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-teal-50 text-[#0F766E] flex items-center justify-center">
                          <Icon className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">{item.category}</h3>
                      </div>
                      <Badge variant={item.isPositive ? "success" : "warning"}>
                        {item.trend}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">{item.spec}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                        Benchmark Rate
                      </span>
                      <span className="text-sm font-bold text-slate-900">{item.benchmarkRate}</span>
                    </div>
                    <Link
                      href="/business/auth"
                      className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1"
                    >
                      <span>Trade</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Industry Solutions (Role-specific segmentation) */}
        <section id="sectors" className="bg-white border-y border-slate-200 py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">
                Tailored Workflows
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Operating Solutions for Every Stakeholder
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Purpose-built interfaces tailored to households, collection logistics fleets, industrial
                recyclers, and commercial enterprises.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {solutions.map((sol, idx) => {
                const Icon = sol.icon;
                return (
                  <div
                    key={idx}
                    className="rounded-lg border border-slate-200 bg-white p-6 shadow-2xs flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{sol.role}</h3>
                          <p className="text-xs text-[#0F766E] font-medium">{sol.tagline}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{sol.description}</p>

                      <ul className="space-y-2 pt-2 border-t border-slate-100">
                        {sol.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-center gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#0F766E] shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <Link href={sol.link}>
                        <Button variant="secondary" size="default" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                          {sol.linkText}
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works Workflow Architecture */}
        <section id="how-it-works" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">
              Verifiable Traceability
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              The RecircleX Circular Supply Chain
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              From citizen scrap segregation to industrial smelting and certified remanufacturing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-2xs space-y-3 relative"
              >
                <div className="text-xl font-extrabold text-[#0F766E] font-mono">{step.num}</div>
                <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust, Governance & EPR Credentials */}
        <section className="bg-white border-y border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 space-y-2 border-r last:border-r-0 border-slate-100">
                <ShieldCheck className="h-8 w-8 text-[#0F766E] mx-auto" />
                <div className="text-sm font-bold text-slate-900">CPCB-aligned operations</div>
                <p className="text-[11px] text-slate-500">Authorized for National EPR fulfillment manifests</p>
              </div>

              <div className="p-4 space-y-2 border-r last:border-r-0 border-slate-100">
                <Scale className="h-8 w-8 text-[#0F766E] mx-auto" />
                <div className="text-sm font-bold text-slate-900">Calibrated Scale Intake</div>
                <p className="text-[11px] text-slate-500">Legal metrology compliant electronic weighing</p>
              </div>

              <div className="p-4 space-y-2 border-r last:border-r-0 border-slate-100">
                <Award className="h-8 w-8 text-[#0F766E] mx-auto" />
                <div className="text-sm font-bold text-slate-900">ISO 14001 Target Standard</div>
                <p className="text-[11px] text-slate-500">Audited environmental management standard</p>
              </div>

              <div className="p-4 space-y-2">
                <Leaf className="h-8 w-8 text-[#0F766E] mx-auto" />
                <div className="text-sm font-bold text-slate-900">Scope-3 COâ‚‚ Avoidance</div>
                <p className="text-[11px] text-slate-500">GHG Protocol verified emission reduction ledgers</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <div className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">
              Common Questions
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3 pt-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900">{faq.q}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Ready to transform your recycling operations?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Join over 10,000 households and 380+ certified recycling mills standardizing circular operations across India.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link href="/individual/auth">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Schedule Pickup
                </Button>
              </Link>
              <Link href="/business/auth">
                <Button variant="secondary" size="lg">
                  Enterprise Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

