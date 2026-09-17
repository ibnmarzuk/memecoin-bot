import type { Coin } from "@/lib/types";
import { TokenMark, Delta } from "@/components/marks";
import { formatUsd } from "@/lib/format";

export function TickerTape({
  coins,
  onPick,
}: {
  coins: Coin[];
  onPick: (id: string) => void;
}) {
  if (coins.length === 0) {
    return <div className="h-12 border-b border-border bg-background" />;
  }
  const loop = [...coins, ...coins];

  return (
    <div className="relative border-b border-border bg-background">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent" />
      <div className="overflow-hidden">
        <div className="tape-track flex w-max gap-1 py-2">
          {loop.map((c, i) => (
            <button
              key={`${c.id}-${i}`}
              type="button"
              onClick={() => onPick(c.id)}
              className="flex h-9 items-center gap-2 rounded-sm px-2.5 text-left hover:bg-accent"
            >
              <TokenMark symbol={c.symbol} imageUrl={c.imageUrl} size="sm" />
              <span className="text-xs font-medium">{c.symbol}</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {formatUsd(c.priceUsd)}
              </span>
              <Delta value={c.changeH24} className="text-xs" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
