"use client";

import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";

export const SearchUsers = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="w-full max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const formData = new FormData(form);
          const queryTerm = (formData.get("search") as string) || "";
          router.push(pathname + "?search=" + encodeURIComponent(queryTerm));
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-industrial-400" />
          <input
            id="search"
            name="search"
            type="text"
            placeholder="Search users by name or email..."
            className="w-full rounded-xl border border-industrial-700 bg-industrial-900/90 pl-10 pr-4 py-2.5 text-sm text-white placeholder-industrial-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 transition-colors"
        >
          Search
        </button>
      </form>
    </div>
  );
};
