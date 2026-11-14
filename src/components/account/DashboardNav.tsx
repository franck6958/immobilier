"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  Building2,
  Home,
  Inbox,
  KeyRound,
  LayoutDashboard,
  MessageSquareText,
  PlusCircle,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = { Building2, Home, Inbox, KeyRound, LayoutDashboard, MessageSquareText, PlusCircle, ShieldCheck, UserRound, Users };

export type NavItem = { href: string; label: string; icon: keyof typeof icons; exact?: boolean };

export function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const isActive = (it: NavItem) => (it.exact ? pathname === it.href : pathname === it.href || pathname.startsWith(it.href + "/"));
  return (
    <nav aria-label="Navigation de l'espace" className="lg:sticky lg:top-28 lg:self-start">
      <ul className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
        {items.map((it) => {
          const Icon = icons[it.icon];
          const active = isActive(it);
          return (
            <li key={it.href} className="shrink-0">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition-colors",
                  active ? "text-paper" : "text-ink hover:bg-white",
                )}
              >
                {active && (
                  <motion.span layoutId="dash-nav" className="absolute inset-0 rounded-2xl bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                )}
                <Icon className={cn("relative size-[1.125rem]", active ? "text-accent" : "text-muted")} aria-hidden />
                <span className="relative whitespace-nowrap">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
