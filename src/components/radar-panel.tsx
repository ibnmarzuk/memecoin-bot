import { useMemo, useState } from "react";
import { Bookmark } from "lucide-react";
import type { Coin } from "@/lib/types";
import { useDeskStore } from "@/lib/store";
import { formatUsd, heatScore } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TokenMark, Delta, HeatBar } from "@/components/marks";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type Filter = "all" | "heat" | "watch";

export function RadarPanel({
  coins,
  loading,
  error,
  onRetry,
  onPick,
}: {
  coins: Coin[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onPick: (id: string) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const selectedId = useDeskStore((s) => s.selectedId);
  const watchlist = useDeskStore((s) => s.watchlist);

  const rows = useMemo(() => {
    const watched = new Set(watchlist.map((w) => w.id));
    let list = coins;
    if (filter === "watch") list = coins.filter((c) => watched.has(c.id));
    const scored = list.map((c) => ({ coin: c, heat: heatScore(c) }));
    if (filter === "heat" || filter === "all") {
      scored.sort((a, b) =>
        filter === "heat" ? b.heat - a.heat : b.coin.volume24h - a.coin.volume24h,
      );
    }
    return scored;
  }, [coins, filter, watchlist]);

  return (
    <section className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex items-center justify-between gap-2 px-4 py-3">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground">
            TAPE
          </p>
          <p className="text-sm text-foreground">Live meme radar</p>
        </div>
        <div className="flex rounded-md bg-secondary p-1">
          {(
            [
              ["all", "Vol"],
              ["heat", "Heat"],
              ["watch", "Desk"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "h-8 rounded-sm px-2.5 text-xs font-medium transition-colors duration-150",
                filter === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {loading && coins.length === 0 ? (
          <div className="space-y-2 px-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : error && coins.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-muted-foreground">Tape is quiet.</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
              Retry
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            {filter === "watch" ? "Nothing pinned yet." : "No coins on the tape."}
          </div>
        ) : (
          <ul className="space-y-1">
            {rows.map(({ coin, heat }, i) => {
              const active = coin.id === selectedId;
              return (
                <li
                  key={coin.id}
                  className="enter-rise"
                  style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => onPick(coin.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-[background-color,box-shadow] duration-150",
                      active
                        ? "bg-accent shadow-[var(--shadow-border-hover)]"
                        : "hover:bg-accent/70",
                    )}
                  >
                    <TokenMark symbol={coin.symbol} imageUrl={coin.imageUrl} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{coin.symbol}</span>
                        {watchlist.some((w) => w.id === coin.id) ? (
                          <Bookmark className="size-3 fill-primary text-primary" />
                        ) : null}
                        <span className="ml-auto text-sm tabular-nums">
                          {formatUsd(coin.priceUsd)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="truncate text-xs text-muted-foreground">
                          {coin.chainLabel}
                        </span>
                        <div className="w-12">
                          <HeatBar value={heat} />
                        </div>
                        <Delta value={coin.changeH24} className="ml-auto text-xs" />
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
