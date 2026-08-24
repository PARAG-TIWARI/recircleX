"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  Recycle,
  Search,
  MapPin,
  ChevronDown,
  User,
  ShieldCheck,
  Bell,
  Check,
  ExternalLink,
  Building2,
  Truck,
  Home,
  Factory,
  Shield,
  X,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notificationsApi, NotificationItem } from "@/lib/api/notifications";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();
  const userRole = (user?.publicMetadata?.role as string) || "GUEST";

  const [searchQuery, setSearchQuery] = useState("");
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSignedIn) {
      notificationsApi
        .getNotifications(10)
        .then((res) => {
          setNotifications(res.items);
          setUnreadCount(res.unread_count);
        })
        .catch(() => { });
    }
  }, [isSignedIn]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await notificationsApi.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/business/recycler/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getWorkspaceHref = () => {
    switch (userRole) {
      case "HOUSEHOLD":
        return "/individual/household";
      case "COLLECTOR":
        return "/individual/collector";
      case "RECYCLER":
        return "/business/recycler";
      case "ENTERPRISE":
        return "/business/enterprise";
      case "ADMIN":
      case "admin":
        return "/admin";
      default:
        return "/individual/household";
    }
  };

  const workspaces = [
    { label: "Household Workspace", href: "/individual/household", role: "HOUSEHOLD", icon: Home },
    { label: "Collector Operations", href: "/individual/collector", role: "COLLECTOR", icon: Truck },
    { label: "Recycler Procurement", href: "/business/recycler", role: "RECYCLER", icon: Factory },
    { label: "Enterprise ESG Hub", href: "/business/enterprise", role: "ENTERPRISE", icon: Building2 },
    { label: "Admin Console", href: "/admin", role: "ADMIN", icon: Shield },
  ];

  const isPublicPage = pathname === "/" || pathname === "/individual/auth" || pathname === "/business/auth";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-2xs">
      <div className="mx-auto flex h-16 max-w-[90%] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <img src="/logo.png" alt="RecircleX Logo" className="h-9 w-9 rounded-lg object-contain" />
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-tight">
                Recircle<span className="text-[#0F766E]">X</span>
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Enterprise OS
              </span>
            </div>
          </Link>

          {/* Public Corporate Nav Links */}
          {isPublicPage && (
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
              <Link href="/#how-it-works" className="hover:text-[#0F766E] transition-colors">
                Logistics Workflow
              </Link>
              <Link href="/#sectors" className="hover:text-[#0F766E] transition-colors">
                Sectors Served
              </Link>
              <Link href="/business/recycler/marketplace" className="hover:text-[#0F766E] transition-colors">
                B2B Marketplace
              </Link>
              <Link href="/#faq" className="hover:text-[#0F766E] transition-colors">
                FAQ
              </Link>
            </nav>
          )}

          {/* Authenticated Workspace Switcher */}
          {isSignedIn && !isPublicPage && (
            <div ref={roleRef} className="relative hidden sm:block">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 hover:bg-slate-100 transition-colors text-left"
              >
                <span className="text-xs font-semibold text-slate-800">
                  {workspaces.find((w) => pathname.startsWith(w.href))?.label || "Select Workspace"}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </button>

              {showRoleMenu && (
                <div className="absolute left-0 top-full mt-1.5 w-60 rounded-lg border border-slate-200 bg-white p-1.5 shadow-popover z-50 animate-in fade-in-50">
                  <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Active Workspace
                  </div>
                  <div className="space-y-0.5">
                    {workspaces.map((ws) => {
                      const Icon = ws.icon;
                      const active = pathname.startsWith(ws.href);
                      return (
                        <Link
                          key={ws.role}
                          href={ws.href}
                          onClick={() => setShowRoleMenu(false)}
                          className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${active
                              ? "bg-teal-50 text-[#0F766E] font-semibold"
                              : "text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                          <Icon className={`h-4 w-4 ${active ? "text-[#0F766E]" : "text-slate-400"}`} />
                          <span>{ws.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Actions, Notifications, Auth */}
        <div className="flex items-center gap-3">
          {isPublicPage ? (
            <>
              <Link href="/individual/auth">
                <Button variant="secondary" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/individual/auth">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                  Schedule Pickup
                </Button>
              </Link>
            </>
          ) : (
            <>
              {/* In-App Notifications Dropdown */}
              {isSignedIn && (
                <div ref={notifRef} className="relative">
                  <button
                    onClick={() => setShowNotifMenu(!showNotifMenu)}
                    className="relative p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
                    title="Notifications"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#0F766E] text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifMenu && (
                    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-lg border border-slate-200 bg-white shadow-popover z-50 animate-in fade-in-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Notifications
                          </h4>
                          {unreadCount > 0 && (
                            <Badge variant="info">{unreadCount} new</Badge>
                          )}
                        </div>
                        <button
                          onClick={async () => {
                            await notificationsApi.markAllAsRead();
                            setNotifications((prev) =>
                              prev.map((n) => ({ ...n, is_read: true }))
                            );
                            setUnreadCount(0);
                          }}
                          className="text-[11px] font-semibold text-[#0F766E] hover:underline"
                        >
                          Mark all read
                        </button>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-3.5 text-xs transition-colors hover:bg-slate-50/80 flex items-start justify-between gap-3 ${!n.is_read ? "bg-teal-50/40" : ""
                                }`}
                            >
                              <div className="space-y-1 flex-1">
                                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                  {!n.is_read && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
                                  )}
                                  <span>{n.title}</span>
                                </div>
                                <p className="text-slate-600 leading-normal">{n.message}</p>
                                <span className="text-[10px] text-slate-400 block font-medium">
                                  {new Date(n.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              {!n.is_read && (
                                <button
                                  onClick={() => handleMarkAsRead(n.id)}
                                  className="text-[10px] font-semibold text-[#0F766E] hover:underline shrink-0"
                                >
                                  Dismiss
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Profile */}
              {isSignedIn ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <UserButton afterSignOutUrl="/" />
                </div>
              ) : (
                <Link href="/individual/auth">
                  <Button variant="primary" size="sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
