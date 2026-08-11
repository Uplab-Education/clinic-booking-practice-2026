"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Avatar } from "@base-ui/react/avatar";
import { Menu } from "@base-ui/react/menu";
import { Separator } from "@base-ui/react/separator";
import { useAuth } from "@/auth/auth-provider";
import type { UserRole } from "@/auth/users";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const navigation = [
  { href: "/", label: "Overview", roles: ["patient", "admin"] },
  { href: "/doctors", label: "Doctors", roles: ["patient", "admin"] },
  { href: "/appointments", label: "My appointments", roles: ["patient"] },
  { href: "/admin", label: "Admin", roles: ["admin"] },
] satisfies Array<{ href: string; label: string; roles: UserRole[] }>;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const role = user?.role ?? "patient";
  const visibleNavigation = navigation.filter((item) => item.roles.includes(role));
  const initials = user?.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const accountLabel = user?.role === "admin" ? "Administrator" : "Patient";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="px-5 py-5">
            <Link className="flex items-center gap-3" href="/">
              <span className="flex size-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-white">
                CB
              </span>
              <span>
                <span className="block text-sm font-semibold">Clinic Booking</span>
                <span className="block text-xs text-slate-500">Appointment workspace</span>
              </span>
            </Link>
          </div>

          <Separator className="h-px bg-slate-200" />

          <NavigationList items={visibleNavigation} pathname={pathname} />

          <div className="border-t border-slate-200 p-4 text-xs leading-5 text-slate-500">
            Doctors, schedules, and appointments in one place.
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6">
              <Link className="flex min-w-0 items-center gap-3 lg:hidden" href="/">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-xs font-semibold text-white">
                  CB
                </span>
                <span className="truncate text-sm font-semibold">Clinic Booking</span>
              </Link>

              <p className="hidden min-w-0 text-sm text-slate-500 lg:block">
                Book clinic visits without phone calls.
              </p>

              <AccountControl
                accountLabel={accountLabel}
                initials={initials}
                isAuthenticated={isAuthenticated}
                logout={logout}
                userName={user?.name}
              />
            </div>
          </header>

          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-lg backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-1">
          {visibleNavigation.slice(0, 4).map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                className={cn(
                  "rounded-md px-2 py-2 text-center text-xs font-medium",
                  active ? "bg-slate-950 text-white" : "text-slate-500",
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function NavigationList({
  items,
  pathname,
}: {
  items: typeof navigation;
  pathname: string;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {items.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
            )}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountControl({
  accountLabel,
  initials,
  isAuthenticated,
  logout,
  userName,
}: {
  accountLabel: string;
  initials?: string;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  userName?: string;
}) {
  if (!isAuthenticated) {
    return (
      <Button asChild href="/login" variant="secondary">
        Login
      </Button>
    );
  }

  return (
    <Menu.Root>
      <Menu.Trigger className="flex min-w-0 items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-left text-sm shadow-sm transition hover:bg-slate-50">
        <Avatar.Root className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 font-medium text-slate-700">
          <Avatar.Fallback>{initials}</Avatar.Fallback>
        </Avatar.Root>
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate font-medium text-slate-950">{userName}</span>
          <span className="block truncate text-xs text-slate-500">{accountLabel}</span>
        </span>
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8}>
          <Menu.Popup className="z-50 min-w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-xl outline-none">
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium text-slate-950">{userName}</p>
              <p className="text-xs text-slate-500">{accountLabel}</p>
            </div>
            <Separator className="my-1 h-px bg-slate-100" />
            <Menu.Item
              className="cursor-pointer rounded-md px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50 data-[highlighted]:bg-red-50"
              onClick={() => {
                void logout();
              }}
            >
              Logout
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
