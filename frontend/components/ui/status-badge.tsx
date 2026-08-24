import React from "react";
import { Badge } from "./badge";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Package,
  Layers,
  XCircle,
  ShieldCheck,
} from "lucide-react";

interface StatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, className = "", showIcon = true }: StatusBadgeProps) {
  const norm = (status || "").toUpperCase();

  switch (norm) {
    case "AVAILABLE":
    case "ACTIVE":
      return (
        <Badge variant="success" className={className}>
          {showIcon && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
          <span>{norm === "AVAILABLE" ? "Available" : "Active"}</span>
        </Badge>
      );
    case "REQUESTED":
    case "PENDING":
      return (
        <Badge variant="warning" className={className}>
          {showIcon && <Clock className="h-3 w-3 text-amber-600" />}
          <span>Pending Request</span>
        </Badge>
      );
    case "ASSIGNED":
    case "SCHEDULED":
      return (
        <Badge variant="info" className={className}>
          {showIcon && <ShieldCheck className="h-3 w-3 text-teal-600" />}
          <span>Assigned</span>
        </Badge>
      );
    case "ON_THE_WAY":
    case "IN_TRANSIT":
      return (
        <Badge variant="info" className={`bg-sky-50 text-sky-800 border-sky-200 ${className}`}>
          {showIcon && <Truck className="h-3 w-3 text-sky-600" />}
          <span>On The Way</span>
        </Badge>
      );
    case "COLLECTED":
    case "COMPLETED":
    case "DELIVERED":
      return (
        <Badge variant="success" className={className}>
          {showIcon && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
          <span>{norm === "COLLECTED" ? "Collected" : "Completed"}</span>
        </Badge>
      );
    case "RESERVED":
      return (
        <Badge variant="warning" className={`bg-indigo-50 text-indigo-800 border-indigo-200 ${className}`}>
          {showIcon && <Package className="h-3 w-3 text-indigo-600" />}
          <span>Reserved</span>
        </Badge>
      );
    case "CONFIRMED":
      return (
        <Badge variant="info" className={className}>
          {showIcon && <CheckCircle2 className="h-3 w-3 text-teal-600" />}
          <span>Confirmed</span>
        </Badge>
      );
    case "SOLD":
      return (
        <Badge variant="secondary" className={className}>
          {showIcon && <Layers className="h-3 w-3 text-slate-500" />}
          <span>Sold</span>
        </Badge>
      );
    case "CANCELLED":
    case "REJECTED":
      return (
        <Badge variant="danger" className={className}>
          {showIcon && <XCircle className="h-3 w-3 text-rose-600" />}
          <span>Cancelled</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className={className}>
          <span>{status}</span>
        </Badge>
      );
  }
}
