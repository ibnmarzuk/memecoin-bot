import type { ReactNode } from "react";
import { Bookmark, Copy, ExternalLink, ScanLine } from "lucide-react";
import { toast } from "sonner";
import type { Coin } from "@/lib/types";
import { useDeskStore } from "@/lib/store";
import {
  formatAge,
  formatUsd,
  heatScore,
  riskFromCoin,
  shortAddress,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { TokenMark, Delta, HeatBar } from "@/components/marks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-md bg-secondary px-3 py-2.5">
      <p className="text-xs tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-medium tabular-nums">{children}</div>
    </div>
  );
}

export function CoinPanel({
  coin,
  scanning,
  onScan,
  onAsk,
}: {
  coin: Coin | null;
  scanning: boolean;
  onScan: () => void;
  onAsk: (prompt: string) => void;
}) {
  const toggleWatch = useDeskStore((s) => s.toggleWatch);
  const watchlist = useDeskStore((s) => s.watchlist);

  if (!coin) {
    return (
      <section className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="font-display text-3xl italic text-foreground">Pick a coin</p>
        <p className="max-w-xs text-sm leading-normal text-muted-foreground">
          Select something on the tape and FREN will keep it pinned while you talk.
        </p>
      </section>
    );
  }

  const watching = watchlist.some((w) => w.id === coin.id);
  const heat = heatScore(coin);
  const flags = riskFromCoin(coin);
  const tape = [
    { label: "1h", value: coin.changeH1 },
    { label: "6h", value: coin.changeH6 },
    { label: "24h", value: coin.changeH24 },
    { label: "7d", value: coin.changeD7 },
  ];

  async function copyAddress() {
    if (!coin?.tokenAddress) return;
    try {
      await navigator.clipboard.writeText(coin.tokenAddress);
      toast("Address copied");
    } catch {
      toast("Could not copy");
    }
  }

  return (
    <section className="scrollbar-thin flex h-full min-h-0 flex-col overflow-y-auto">
      <header className="px-5 pt-5 pb-4">
        <div className="flex items-start gap-3">
          <TokenMark symbol={coin.symbol} imageUrl={coin.imageUrl} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-3xl italic leading-tight">{coin.symbol}</h2>
              <Badge>{coin.chainLabel}</Badge>
            </div>
            <p className="truncate text-sm text-muted-foreground">{coin.name}</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={watching ? "Unpin from desk" : "Pin to desk"}
            onClick={() =>
              toggleWatch({
                id: coin.id,
                symbol: coin.symbol,
                name: coin.name,
                imageUrl: coin.imageUrl,
              })
            }
          >
            <Bookmark className={cn("size-4", watching && "fill-primary text-primary")} />
          </Button>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="text-2xl font-medium tabular-nums tracking-tight">
            {formatUsd(coin.priceUsd)}
          </p>
          <Delta value={coin.changeH24} className="text-base" />
        </div>
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Heat</span>
            <span className="tabular-nums">{heat}</span>
          </div>
          <HeatBar value={heat} />
        </div>
      </header>

      <div className="grid grid-cols-4 gap-1 px-5">
        {tape.map((t) => (
          <div key={t.label} className="rounded-md bg-secondary px-2 py-2 text-center">
            <p className="text-xs text-muted-foreground">{t.label}</p>
            <Delta value={t.value} className="text-xs" />
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 px-5">
        <Stat label="Market cap">{formatUsd(coin.marketCap)}</Stat>
        <Stat label="Volume 24h">{formatUsd(coin.volume24h)}</Stat>
        <Stat label="Liquidity">{formatUsd(coin.liquidityUsd)}</Stat>
        <Stat label="Age">{formatAge(coin.pairCreatedAt ?? coin.listedAt)}</Stat>
      </div>

      {coin.buys24h != null && coin.sells24h != null ? (
        <p className="mt-3 px-5 text-xs text-muted-foreground">
          Tape{" "}
          <span className="tabular-nums text-foreground">
            {coin.buys24h} buys / {coin.sells24h} sells
          </span>{" "}
          in 24h
          {coin.boosted ? ` · ${coin.boosted} paid boosts` : ""}
        </p>
      ) : coin.rank ? (
        <p className="mt-3 px-5 text-xs text-muted-foreground">
          Rank <span className="tabular-nums text-foreground">#{coin.rank}</span>
          {coin.source === "listed" ? " · aggregated listing, not a pool" : ""}
        </p>
      ) : null}

      {flags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5 px-5">
          {flags.map((f) => (
            <Badge key={f} className="text-warn">
              {f}
            </Badge>
          ))}
        </div>
      ) : null}

      {coin.tokenAddress ? (
        <div className="mt-3 flex items-center gap-2 px-5">
          <p className="min-w-0 truncate text-xs text-muted-foreground">
            {shortAddress(coin.tokenAddress)}
          </p>
          <Button variant="ghost" size="icon-sm" aria-label="Copy address" onClick={copyAddress}>
            <Copy className="size-3.5" />
          </Button>
          {coin.url ? (
            <a
              href={coin.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex size-9 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
              aria-label="Open market page"
            >
              <ExternalLink className="size-3.5" />
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto flex flex-col gap-2 p-5">
        <Button onClick={onScan} disabled={scanning} className="h-12 rounded-lg">
          <ScanLine />
          {scanning ? "Reading tape…" : "Scan with FREN"}
        </Button>
        <Button
          variant="outline"
          className="h-11 rounded-lg"
          onClick={() => onAsk(`What's the read on ${coin.symbol}?`)}
        >
          Ask about {coin.symbol}
        </Button>
        <p className="text-center text-xs leading-normal text-muted-foreground">
          Not financial advice. Meme coins can go to zero.
        </p>
      </div>
    </section>
  );
}
