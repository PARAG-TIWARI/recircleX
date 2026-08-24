"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Building2,
  ShieldCheck,
  Leaf,
  FileText,
  BarChart3,
  ArrowRight,
  TrendingUp,
  Package,
  CheckCircle2,
  Download,
  Plus,
  Layers,
  Calendar,
  MapPin,
  X,
  ExternalLink,
  ChevronRight,
  Printer,
  FileSpreadsheet,
  AlertCircle,
  Truck,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

export default function EnterpriseDashboard() {
  const { user } = useUser();
  const { toast } = useToast();

  const companyName =
    user?.organizationMemberships?.[0]?.organization?.name ||
    user?.fullName ||
    "Tata Steel & Infrastructure Logistics";

  const [activeTab, setActiveTab] = useState<"overview" | "streams" | "certificates" | "epr">("overview");

  // Certificate Viewer Modal State
  const [selectedCert, setSelectedCert] = useState<{
    id: string;
    title: string;
    material: string;
    quantity: string;
    co2: string;
    recycler: string;
    date: string;
    eprReg: string;
    facility: string;
  } | null>(null);

  // New Stream Request Modal State
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [streamFacility, setStreamFacility] = useState("Mumbai Tech Park Hub");
  const [streamMaterial, setStreamMaterial] = useState("Commercial Cardboard & OCC");
  const [streamEstWeight, setStreamEstWeight] = useState("3.5");

  const certificates = [
    {
      id: "RCX-2026-EPR-041",
      title: "PET Polymer Conversion Audit",
      material: "Post-Consumer PET Polymer",
      quantity: "5.2 Tons",
      co2: "7.8 tCO₂e",
      recycler: "Apex PolyRecycle Industries Ltd",
      date: "August 12, 2026",
      eprReg: "CPCB/EPR-PLAST/2026/08912",
      facility: "Pune Logistics Fulfillment Center",
    },
    {
      id: "RCX-2026-EPR-039",
      title: "Industrial OCC Cardboard Pulped",
      material: "Corrugated Cardboard (OCC)",
      quantity: "8.1 Tons",
      co2: "7.29 tCO₂e",
      recycler: "Bharat Kraft Paper Mills",
      date: "August 04, 2026",
      eprReg: "CPCB/EPR-PAPER/2026/04419",
      facility: "Mumbai Tech Park Hub",
    },
    {
      id: "RCX-2026-EPR-032",
      title: "IT Asset Disposal & Circuit Recovery",
      material: "Decommissioned Servers & PCBs",
      quantity: "2.4 Tons",
      co2: "7.68 tCO₂e",
      recycler: "EcoE-Waste Refiners India",
      date: "July 28, 2026",
      eprReg: "CPCB/EPR-EWASTE/2026/01205",
      facility: "Bangalore Innovation Campus",
    },
    {
      id: "RCX-2026-EPR-027",
      title: "Heavy Structural Steel Scrap Smelted",
      material: "Fabrication Iron & Beam Ends",
      quantity: "14.6 Tons",
      co2: "21.9 tCO₂e",
      recycler: "Maharashtra Secondary Smelters",
      date: "July 15, 2026",
      eprReg: "CPCB/EPR-METAL/2026/03391",
      facility: "Sanand Manufacturing Plant",
    },
  ];

  const wasteStreams = [
    {
      facility: "Mumbai Tech Park Hub",
      stream: "Commercial Cardboard & OCC",
      lastPickup: "Yesterday",
      frequency: "Bi-Weekly",
      volumeMonth: "14.2 Tons",
      recycler: "Bharat Kraft Mills",
      status: "COMPLETED",
    },
    {
      facility: "Pune Logistics Fulfillment Center",
      stream: "Packaging Stretch Films & Straps",
      lastPickup: "3 days ago",
      frequency: "Weekly",
      volumeMonth: "9.8 Tons",
      recycler: "Apex PolyRecycle",
      status: "ACTIVE",
    },
    {
      facility: "Bangalore Innovation Campus",
      stream: "Decommissioned Electronics (PCBs)",
      lastPickup: "Aug 02, 2026",
      frequency: "Monthly",
      volumeMonth: "2.4 Tons",
      recycler: "EcoE-Waste Refiners",
      status: "COMPLETED",
    },
    {
      facility: "Sanand Manufacturing Plant",
      stream: "Machining Turnings & Steel Offcuts",
      lastPickup: "Scheduled (Tomorrow)",
      frequency: "On-Demand",
      volumeMonth: "22.5 Tons",
      recycler: "Maharashtra Smelters",
      status: "SCHEDULED",
    },
  ];

  const handleCreateStream = (e: React.FormEvent) => {
    e.preventDefault();
    toast(`Scheduled bulk dispatch for ${streamFacility} (${streamEstWeight} Tons ${streamMaterial}).`, "success");
    setShowStreamModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F9] text-slate-900 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: "Corporate ESG & EPR Portal" },
            { label: companyName },
          ]}
          title="Enterprise ESG & Commercial Waste OS"
          description="Centralized multi-facility waste collection schedules, CPCB EPR compliance audit ledgers, and verified Scope-3 carbon avoidance tracking."
          action={
            <Button
              variant="primary"
              size="default"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowStreamModal(true)}
            >
              Schedule Bulk Dispatch
            </Button>
          }
        />

        {/* Operational ESG KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Total Recycled (FY26)
                </span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">
                  128.4 <span className="text-xs font-normal text-slate-500">Metric Tons</span>
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Scope-3 Avoided Carbon
                </span>
                <span className="text-xl font-bold text-teal-800 mt-1 block">
                  184.6 <span className="text-xs font-normal text-slate-500">tCO₂e</span>
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
                <Leaf className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  EPR Target Fulfillment
                </span>
                <span className="text-xl font-bold text-emerald-700 mt-1 block">
                  94.2% <span className="text-xs font-normal text-slate-500">(CPCB Verified)</span>
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Active Facilities
                </span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">
                  4 <span className="text-xs font-normal text-slate-500">plants</span>
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "overview" ? "bg-[#0F766E] text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Overview & Facilities
          </button>
          <button
            onClick={() => setActiveTab("streams")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "streams" ? "bg-[#0F766E] text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Facility Scrap Dispatches
          </button>
          <button
            onClick={() => setActiveTab("certificates")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "certificates" ? "bg-[#0F766E] text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            EPR Audit Certificates ({certificates.length})
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Active Facility Streams Table (7 Cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Active Multi-Facility Scrap Operations
                </h2>
                <button
                  onClick={() => setActiveTab("streams")}
                  className="text-xs font-semibold text-[#0F766E] hover:underline"
                >
                  View all streams &rarr;
                </button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facility</TableHead>
                    <TableHead>Material Stream</TableHead>
                    <TableHead>Monthly Vol</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wasteStreams.map((ws, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-semibold text-slate-900">
                        {ws.facility}
                      </TableCell>
                      <TableCell className="text-slate-700">{ws.stream}</TableCell>
                      <TableCell className="font-bold text-slate-900">{ws.volumeMonth}</TableCell>
                      <TableCell>
                        <StatusBadge status={ws.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Right: Verified ESG Governance Cards (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">CPCB EPR Regulatory Compliance</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="p-3 rounded-lg border border-teal-200 bg-teal-50/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Plastic Waste Rules 2024</span>
                      <Badge variant="success">98.4% Compliant</Badge>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Mandatory post-consumer polymer procurement and recycling credits registered under CPCB.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">E-Waste Management Rules</span>
                      <Badge variant="info">100% Certified</Badge>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Decommissioned IT assets transferred to authorized R2 / CPCB certified recyclers.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Streams */}
        {activeTab === "streams" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Facility Scrap Dispatch Schedules
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facility Name</TableHead>
                  <TableHead>Material Stream</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Last Pickup</TableHead>
                  <TableHead>Assigned Recycler</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wasteStreams.map((ws, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-bold text-slate-900">{ws.facility}</TableCell>
                    <TableCell className="text-slate-700">{ws.stream}</TableCell>
                    <TableCell className="text-slate-600">{ws.frequency}</TableCell>
                    <TableCell className="text-slate-600">{ws.lastPickup}</TableCell>
                    <TableCell className="font-medium text-slate-800">{ws.recycler}</TableCell>
                    <TableCell>
                      <StatusBadge status={ws.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Tab 3: Certificates */}
        {activeTab === "certificates" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Digital EPR & Destruction Audit Certificates
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certificate ID</TableHead>
                  <TableHead>Audit Title & Material</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>CO₂ Avoided</TableHead>
                  <TableHead>CPCB EPR Reg #</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-mono font-bold text-slate-800">
                      {cert.id}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      <div>{cert.title}</div>
                      <span className="text-[11px] text-slate-500">{cert.material}</span>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800">{cert.quantity}</TableCell>
                    <TableCell className="text-teal-800 font-bold">{cert.co2}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">{cert.eprReg}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<FileText className="h-3 w-3" />}
                        onClick={() => setSelectedCert(cert)}
                      >
                        Inspect Certificate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* EPR Certificate Viewer Modal */}
        {selectedCert && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedCert(null)}
            title="Official CPCB EPR Destruction Certificate"
            description={`Certificate ID: ${selectedCert.id}`}
            maxWidth="lg"
          >
            <div className="space-y-4 text-xs">
              <div className="border border-slate-300 rounded-lg p-5 bg-slate-50 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="font-mono text-[10px] text-slate-400 block uppercase">Registration Authority</span>
                    <span className="font-bold text-slate-900">Central Pollution Control Board (CPCB)</span>
                  </div>
                  <Badge variant="success">Verified Audit</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Enterprise Origin</span>
                    <span className="font-semibold text-slate-900">{companyName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Facility Origin</span>
                    <span className="font-semibold text-slate-900">{selectedCert.facility}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Material Recovered</span>
                    <span className="font-semibold text-slate-900">{selectedCert.material}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Certified Quantity</span>
                    <span className="font-bold text-base text-[#0F766E]">{selectedCert.quantity}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Secondary Mill Partner</span>
                    <span className="font-semibold text-slate-900">{selectedCert.recycler}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Scope-3 Avoided Carbon</span>
                    <span className="font-bold text-teal-800">{selectedCert.co2}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500">
                  EPR Manifest Registry: <span className="font-mono font-bold text-slate-700">{selectedCert.eprReg}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setSelectedCert(null)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="default"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={() => {
                    toast(`Downloaded official PDF audit certificate: ${selectedCert.id}`, "success");
                    setSelectedCert(null);
                  }}
                >
                  Download PDF Audit
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Schedule Bulk Dispatch Modal */}
        {showStreamModal && (
          <Modal
            isOpen={true}
            onClose={() => setShowStreamModal(false)}
            title="Schedule Bulk Commercial Scrap Dispatch"
            description="Initiate heavy vehicle container pickup for enterprise facility scrap."
            maxWidth="md"
          >
            <form onSubmit={handleCreateStream} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Origin Facility
                </label>
                <select
                  value={streamFacility}
                  onChange={(e) => setStreamFacility(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="Mumbai Tech Park Hub">Mumbai Tech Park Hub</option>
                  <option value="Pune Logistics Fulfillment Center">Pune Logistics Fulfillment Center</option>
                  <option value="Bangalore Innovation Campus">Bangalore Innovation Campus</option>
                  <option value="Sanand Manufacturing Plant">Sanand Manufacturing Plant</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Primary Material Stream
                </label>
                <select
                  value={streamMaterial}
                  onChange={(e) => setStreamMaterial(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="Commercial Cardboard & OCC">Commercial Cardboard & OCC</option>
                  <option value="Packaging Stretch Films & Straps (LDPE)">Packaging Stretch Films & Straps (LDPE)</option>
                  <option value="Industrial Electronic Scrap & PCBs">Industrial Electronic Scrap & PCBs</option>
                  <option value="Machining Steel & Aluminium Offcuts">Machining Steel & Aluminium Offcuts</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Estimated Load Weight (Metric Tons)
                </label>
                <input
                  type="number"
                  step={0.5}
                  min={1}
                  value={streamEstWeight}
                  onChange={(e) => setStreamEstWeight(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={() => setShowStreamModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="default"
                >
                  Schedule Commercial Dispatch
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </main>

      <Footer />
    </div>
  );
}
