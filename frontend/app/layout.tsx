import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthSyncProvider } from "@/providers/auth-sync-provider";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/common/error-boundary";

export const metadata: Metadata = {
  title: "RecircleX",
  description:
    "RecircleX connects households, collection partners, and industrial recyclers on a single digital platform â€” streamlining doorstep pickups, B2B commodity trading, and ESG compliance.",
  icons: [{ rel: "icon", url: "/logo.png", type: "image/png" }, { rel: "shortcut icon", url: "/logo.png" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#059669",
          colorBackground: "#ffffff",
          colorInputBackground: "#f8fafc",
          colorInputText: "#0f172a",
          colorText: "#0f172a",
          colorTextSecondary: "#64748b",
          borderRadius: "0.75rem",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`min-h-screen bg-slate-50 text-slate-900 antialiased`}
          suppressHydrationWarning
        >
          <ErrorBoundary>
            <QueryProvider>
              <AuthSyncProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </AuthSyncProvider>
            </QueryProvider>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}


