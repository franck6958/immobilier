import { cn } from "@/lib/utils";

/** Bandeau défilant infini (CSS pur, se fige si "réduire les animations"). */
export function Marquee({
  items,
  className,
  separator = "✦",
  reverse = false,
}: {
  items: string[];
  className?: string;
  separator?: string;
  reverse?: boolean;
}) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((it) => (
        <li key={it} className="flex items-center">
          <span className="px-6 md:px-10">{it}</span>
          <span aria-hidden className="text-[0.5em] opacity-60">{separator}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className={cn("group flex overflow-hidden whitespace-nowrap", className)}>
      <div
        className={cn(
          "flex animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none",
          reverse && "[animation-direction:reverse]",
        )}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
