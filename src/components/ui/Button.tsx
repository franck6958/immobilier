import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "accent" | "dark" | "light" | "outline" | "outline-light";

const variants: Record<Variant, string> = {
  accent: "bg-accent text-ink hover:bg-[#f06a21]",
  dark: "bg-ink text-paper hover:bg-ink-3",
  light: "bg-paper text-ink hover:bg-white",
  outline: "border-[1.5px] border-ink/80 text-ink hover:bg-ink hover:text-paper",
  "outline-light": "border-[1.5px] border-white/40 text-white hover:bg-white hover:text-ink",
};

const base =
  "group relative inline-flex min-h-12 items-center justify-center gap-2.5 overflow-hidden rounded-full px-6 py-3 text-[0.9375rem] font-semibold tracking-tight transition-[background-color,color,transform,box-shadow] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60";

type Common = { variant?: Variant; icon?: ReactNode | false; className?: string; children: ReactNode };

function Inner({ children, icon }: { children: ReactNode; icon?: ReactNode | false }) {
  return (
    <>
      <span className="relative">{children}</span>
      {icon !== false && (
        <span
          aria-hidden
          className="relative grid size-6 place-items-center overflow-hidden rounded-full bg-current/10"
        >
          <span className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-5 group-hover:-translate-y-5">
            {icon ?? <ArrowUpRight className="size-4" />}
          </span>
          <span className="absolute -translate-x-5 translate-y-5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0 group-hover:translate-y-0">
            {icon ?? <ArrowUpRight className="size-4" />}
          </span>
        </span>
      )}
    </>
  );
}

export function ButtonLink({
  href,
  variant = "accent",
  icon,
  className,
  children,
  ...rest
}: Common & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  const external = typeof href === "string" && /^(https?:|tel:|mailto:)/.test(href);
  const cls = cn(base, variants[variant], className);
  if (external) {
    const h = href as string;
    return (
      <a
        href={h}
        className={cls}
        {...(h.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        <Inner icon={icon}>{children}</Inner>
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      <Inner icon={icon}>{children}</Inner>
    </Link>
  );
}

export function Button({
  variant = "accent",
  icon,
  className,
  children,
  ...rest
}: Common & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button className={cn(base, variants[variant], className)} {...rest}>
      <Inner icon={icon}>{children}</Inner>
    </button>
  );
}
