import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatPct } from "@/lib/format";

export function TokenMark({
  symbol,
  imageUrl,
  size = "sm",
}: {
  symbol: string;
  imageUrl: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const dim = size === "lg" ? "size-12" : size === "md" ? "size-9" : "size-8";
  const letters = symbol.slice(0, 3);

  if (!imageUrl || failed) {
    return (
      <div
        className={cn(
          dim,
          "flex shrink-0 items-center justify-center rounded-sm bg-secondary text-xs font-medium text-muted-foreground",
        )}
        aria-hidden
      >
        {letters}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt=""
      className={cn(
        dim,
        "shrink-0 rounded-sm object-cover outline outline-1 -outline-offset-1 outline-foreground/10",
      )}
      onError={() => setFailed(true)}
    />
  );
}

export function Delta({
  value,
  className,
}: {
  value: number | null | undefined;
  className?: string;
}) {
  if (value == null || !Number.isFinite(value)) {
    return <span className={cn("tabular-nums text-muted-foreground", className)}>—</span>;
  }
  const tone = value > 0 ? "text-up" : value < 0 ? "text-down" : "text-muted-foreground";
  return (
    <span className={cn("tabular-nums", tone, className)}>{formatPct(value)}</span>
  );
}

export function HeatBar({ value }: { value: number }) {
  const w = Math.max(4, Math.min(100, value));
  return (
    <div
      className="h-1 w-full overflow-hidden rounded-full bg-secondary"
      title={`Heat ${value}`}
    >
      <div
        className="h-full rounded-full bg-primary/80"
        style={{ width: `${w}%` }}
      />
    </div>
  );
}
