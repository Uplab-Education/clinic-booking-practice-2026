import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type FilterChipLinkProps = {
  href: string;
  isActive: boolean;
  children: ReactNode;
};

export function FilterChipLink({
  href,
  isActive,
  children,
}: FilterChipLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md border px-3 py-2 text-sm font-medium",
        isActive
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      )}
    >
      {children}
    </Link>
  );
}