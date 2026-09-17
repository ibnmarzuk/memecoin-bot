const COMPACT = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

export function formatUsd(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1000) return `$${COMPACT.format(n)}`;
  if (Math.abs(n) >= 1) return `$${n.toFixed(2)}`;
  if (Math.abs(n) >= 0.01) return `$${n.toFixed(4)}`;
  if (Math.abs(n) >= 0.0001) return `$${n.toFixed(6)}`;
  return `$${n.toExponential(2)}`;
}

export function formatCompact(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return COMPACT.format(n);
}

export function formatPct(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const body = abs >= 100 ? abs.toFixed(0) : abs.toFixed(2);
  if (n > 0) return `+${body}%`;
  if (n < 0) return `−${body}%`;
  return `${body}%`;
}

export function formatAge(isoOrMs: string | number | null | undefined): string {
  if (isoOrMs == null) return "—";
  const ms = typeof isoOrMs === "number" ? isoOrMs : Date.parse(isoOrMs);
  if (!Number.isFinite(ms)) return "—";
  const delta = Date.now() - ms;
  if (delta < 0) return "new";
  const mins = Math.floor(delta / 60_000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 90) return `${days}d`;
  const years = Math.floor(days / 365);
  return years >= 1 ? `${years}y` : `${Math.floor(days / 30)}mo`;
}

export function heatScore(input: {
  volume24h: number;
  changeH1: number | null;
  changeH24: number | null;
  boosted: number | null;
}): number {
  const vol = Math.log10(Math.max(input.volume24h, 1));
  const volN = clamp(vol / 9, 0, 1);
  const d24 = clamp(Math.abs(input.changeH24 ?? 0) / 60, 0, 1);
  const d1 = clamp(Math.abs(input.changeH1 ?? 0) / 15, 0, 1);
  const boost = input.boosted && input.boosted > 0 ? 0.08 : 0;
  return Math.round(100 * clamp(0.5 * volN + 0.32 * d24 + 0.18 * d1 + boost, 0, 1));
}

export function riskFromCoin(coin: {
  liquidityUsd: number | null;
  pairCreatedAt: number | null;
  listedAt: string | null;
  buys24h: number | null;
  sells24h: number | null;
  source: "dex" | "listed";
}): string[] {
  const flags: string[] = [];
  if (coin.source === "listed") {
    flags.push("Listed tape — not a fresh pool");
  }
  if (coin.liquidityUsd != null && coin.liquidityUsd < 15_000) {
    flags.push("Thin book");
  }
  if (coin.pairCreatedAt) {
    const hours = (Date.now() - coin.pairCreatedAt) / 3_600_000;
    if (hours < 24) flags.push("Newborn pair");
    else if (hours < 72) flags.push("Young pair");
  }
  if (coin.buys24h != null && coin.sells24h != null) {
    const total = coin.buys24h + coin.sells24h;
    if (total > 20 && coin.sells24h / total > 0.65) flags.push("Sell-heavy tape");
    if (total > 20 && coin.buys24h / total > 0.7) flags.push("Buy-heavy tape");
  }
  return flags;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function toSnap(coin: {
  id: string;
  symbol: string;
  name: string;
  chainLabel: string;
  source: "dex" | "listed";
  priceUsd: number;
  changeH1: number | null;
  changeH24: number | null;
  volume24h: number;
  marketCap: number | null;
  liquidityUsd: number | null;
  buys24h: number | null;
  sells24h: number | null;
  boosted: number | null;
  rank: number | null;
}) {
  return {
    id: coin.id,
    symbol: coin.symbol,
    name: coin.name,
    chainLabel: coin.chainLabel,
    source: coin.source,
    priceUsd: coin.priceUsd,
    changeH1: coin.changeH1,
    changeH24: coin.changeH24,
    volume24h: coin.volume24h,
    marketCap: coin.marketCap,
    liquidityUsd: coin.liquidityUsd,
    buys24h: coin.buys24h,
    sells24h: coin.sells24h,
    boosted: coin.boosted,
    rank: coin.rank,
  };
}

export function shortAddress(addr: string | null | undefined): string {
  if (!addr) return "—";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function looksLikeAddress(q: string): boolean {
  const s = q.trim();
  if (/^0x[a-fA-F0-9]{40}$/.test(s)) return true;
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s)) return true;
  return false;
}
