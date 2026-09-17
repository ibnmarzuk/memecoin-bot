import { createServerFn } from "@tanstack/react-start";
import type { Coin, RadarResponse } from "@/lib/types";
import { looksLikeAddress } from "@/lib/format";

const DESK_UNIVERSE = [
  "doge-dogecoin",
  "shib-shiba-inu",
  "pepe-pepe",
  "trump-official-trump",
  "spx-spx6900",
  "floki-floki-inu",
  "bonk-bonk",
  "wif-dogwifcoin",
  "fartcoin-fartcoin",
  "bome-book-of-meme",
  "turbo-turbo",
  "brett-brett-base",
  "toshi-toshi",
  "pnut-peanut-the-squirrel",
  "popcat-popcat",
  "moodeng-moo-deng-moodengsolcom",
  "mog-mog-coin",
  "mew-cat-in-a-dogs-world",
  "neiro-first-neiro-on-ethereum",
  "meme-memecoin",
  "giga-gigachad",
  "goat-goatseus-maximus",
  "ponke-ponke",
  "npc-non-playable-coin",
];

const CHAIN_LABEL: Record<string, string> = {
  solana: "Solana",
  ethereum: "Ethereum",
  base: "Base",
  bsc: "BNB",
  arbitrum: "Arbitrum",
  polygon: "Polygon",
  avalanche: "Avalanche",
  optimism: "Optimism",
  ton: "TON",
  sui: "Sui",
  hyperevm: "HyperEVM",
  "pulsechain": "Pulse",
};

type CacheEntry<T> = { at: number; data: T };
const cache = new Map<string, CacheEntry<unknown>>();

function cached<T>(key: string, ttl: number, data: T | null | undefined): T | null {
  if (data) cache.set(key, { at: Date.now(), data });
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  if (!hit) return null;
  if (Date.now() - hit.at > ttl) return null;
  return hit.data;
}

async function fetchJson<T>(url: string, timeoutMs = 8000): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "FRENDesk/1.0",
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  return (await res.json()) as T;
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      out[i] = await fn(items[i]!);
    }
  }
  const n = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: n }, worker));
  return out;
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function chainLabel(id: string): string {
  return CHAIN_LABEL[id] ?? id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type PaprikaTicker = {
  id: string;
  name: string;
  symbol: string;
  rank: number | null;
  first_data_at?: string;
  quotes?: {
    USD?: {
      price?: number;
      volume_24h?: number;
      market_cap?: number;
      percent_change_15m?: number;
      percent_change_1h?: number;
      percent_change_6h?: number;
      percent_change_24h?: number;
      percent_change_7d?: number;
    };
  };
};

function fromPaprika(t: PaprikaTicker): Coin | null {
  const usd = t.quotes?.USD;
  const price = num(usd?.price);
  if (price == null) return null;
  return {
    id: `listed:${t.id}`,
    source: "listed",
    chainId: "listed",
    chainLabel: "Listed",
    tokenAddress: null,
    pairAddress: null,
    dexId: null,
    url: `https://coinpaprika.com/coin/${t.id}/`,
    name: t.name,
    symbol: (t.symbol || "").toUpperCase(),
    imageUrl: `https://static.coinpaprika.com/coin/${t.id}/logo.png`,
    priceUsd: price,
    changeM5: num(usd?.percent_change_15m),
    changeH1: num(usd?.percent_change_1h),
    changeH6: num(usd?.percent_change_6h),
    changeH24: num(usd?.percent_change_24h),
    changeD7: num(usd?.percent_change_7d),
    volume24h: num(usd?.volume_24h) ?? 0,
    buys24h: null,
    sells24h: null,
    liquidityUsd: null,
    marketCap: num(usd?.market_cap),
    fdv: null,
    pairCreatedAt: null,
    listedAt: t.first_data_at ?? null,
    rank: t.rank ?? null,
    boosted: null,
    description: null,
    websites: [],
  };
}

type DexPair = {
  chainId?: string;
  dexId?: string;
  url?: string;
  pairAddress?: string;
  baseToken?: { address?: string; name?: string; symbol?: string };
  quoteToken?: { address?: string; name?: string; symbol?: string };
  priceUsd?: string;
  txns?: { h24?: { buys?: number; sells?: number }; h1?: { buys?: number; sells?: number } };
  volume?: { h24?: number; h6?: number; h1?: number; m5?: number };
  priceChange?: { m5?: number; h1?: number; h6?: number; h24?: number };
  liquidity?: { usd?: number };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  info?: {
    imageUrl?: string;
    websites?: { url?: string }[];
    socials?: { platform?: string; handle?: string; url?: string }[];
  };
  boosts?: { active?: number };
};

const SKIP_SYMBOLS = new Set([
  "USDC",
  "USDT",
  "DAI",
  "USD1",
  "USDS",
  "FDUSD",
  "USDE",
  "PYUSD",
  "SOL",
  "ETH",
  "WETH",
  "WSOL",
  "BTC",
  "WBTC",
  "BNB",
  "WBNB",
]);

function fromDex(p: DexPair): Coin | null {
  const price = num(p.priceUsd);
  const base = p.baseToken;
  if (price == null || !base?.symbol || !p.chainId) return null;
  if (SKIP_SYMBOLS.has(base.symbol.toUpperCase())) return null;
  const tokenAddress = base.address ?? null;
  return {
    id: `dex:${p.chainId}:${tokenAddress ?? p.pairAddress ?? base.symbol}`,
    source: "dex",
    chainId: p.chainId,
    chainLabel: chainLabel(p.chainId),
    tokenAddress,
    pairAddress: p.pairAddress ?? null,
    dexId: p.dexId ?? null,
    url: p.url ?? null,
    name: base.name || base.symbol,
    symbol: base.symbol.toUpperCase(),
    imageUrl: p.info?.imageUrl ?? null,
    priceUsd: price,
    changeM5: num(p.priceChange?.m5),
    changeH1: num(p.priceChange?.h1),
    changeH6: num(p.priceChange?.h6),
    changeH24: num(p.priceChange?.h24),
    changeD7: null,
    volume24h: num(p.volume?.h24) ?? 0,
    buys24h: p.txns?.h24?.buys ?? null,
    sells24h: p.txns?.h24?.sells ?? null,
    liquidityUsd: num(p.liquidity?.usd),
    marketCap: num(p.marketCap) ?? num(p.fdv),
    fdv: num(p.fdv),
    pairCreatedAt: p.pairCreatedAt ?? null,
    listedAt: p.pairCreatedAt ? new Date(p.pairCreatedAt).toISOString() : null,
    rank: null,
    boosted: p.boosts?.active ?? null,
    description: null,
    websites: (p.info?.websites ?? []).map((w) => w.url).filter((u): u is string => !!u),
  };
}

type DexBoost = {
  chainId?: string;
  tokenAddress?: string;
  icon?: string;
  description?: string;
  amount?: number;
  totalAmount?: number;
};

async function fetchDexRadar(): Promise<Coin[]> {
  const boosts = await fetchJson<DexBoost[]>(
    "https://api.dexscreener.com/token-boosts/top/v1",
    7000,
  );
  if (!Array.isArray(boosts) || boosts.length === 0) return [];

  const byChain = new Map<string, string[]>();
  const boostMap = new Map<string, DexBoost>();
  for (const b of boosts) {
    if (!b.chainId || !b.tokenAddress) continue;
    const list = byChain.get(b.chainId) ?? [];
    if (!list.includes(b.tokenAddress)) list.push(b.tokenAddress);
    byChain.set(b.chainId, list);
    boostMap.set(`${b.chainId}:${b.tokenAddress}`.toLowerCase(), b);
  }

  const coins: Coin[] = [];
  await mapPool([...byChain.entries()], 4, async ([chain, addrs]) => {
    const chunk = addrs.slice(0, 30);
    try {
      const pairs = await fetchJson<DexPair[]>(
        `https://api.dexscreener.com/tokens/v1/${chain}/${chunk.join(",")}`,
        8000,
      );
      if (!Array.isArray(pairs)) return;
      const best = new Map<string, DexPair>();
      for (const p of pairs) {
        const addr = p.baseToken?.address?.toLowerCase();
        if (!addr) continue;
        const prev = best.get(addr);
        const liq = num(p.liquidity?.usd) ?? 0;
        const prevLiq = num(prev?.liquidity?.usd) ?? 0;
        if (!prev || liq > prevLiq) best.set(addr, p);
      }
      for (const p of best.values()) {
        const coin = fromDex(p);
        if (!coin) continue;
        const b = boostMap.get(`${coin.chainId}:${coin.tokenAddress}`.toLowerCase());
        if (b) {
          coin.boosted = num(b.totalAmount) ?? num(b.amount);
          coin.imageUrl = coin.imageUrl ?? b.icon ?? null;
          coin.description = b.description ?? null;
        }
        coins.push(coin);
      }
    } catch {
      /* chain batch failed */
    }
  });

  return coins
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, 28);
}

async function fetchListedRadar(): Promise<Coin[]> {
  const tickers = await mapPool(DESK_UNIVERSE, 6, async (id) => {
    try {
      return await fetchJson<PaprikaTicker>(
        `https://api.coinpaprika.com/v1/tickers/${id}`,
        7000,
      );
    } catch {
      return null;
    }
  });
  return tickers
    .map((t) => (t ? fromPaprika(t) : null))
    .filter((c): c is Coin => !!c)
    .sort((a, b) => b.volume24h - a.volume24h);
}

function mergeRadar(dex: Coin[], listed: Coin[]): Coin[] {
  const out: Coin[] = [];
  const seen = new Set<string>();
  for (const c of [...dex, ...listed]) {
    const key = c.symbol.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out.slice(0, 32);
}

async function loadRadar(): Promise<RadarResponse> {
  const hit = cached<RadarResponse>("radar", 30_000, null);
  if (hit) return hit;

  const dexP = fetchDexRadar().catch(() => [] as Coin[]);
  const listedP = fetchListedRadar().catch(() => [] as Coin[]);
  const dex = await dexP;
  const listedWait = dex.length >= 8 ? 4500 : 8000;
  const listed = await Promise.race([
    listedP,
    new Promise<Coin[]>((resolve) => setTimeout(() => resolve([]), listedWait)),
  ]);
  const coins = mergeRadar(dex, listed);
  const sources: RadarResponse["sources"] = [];
  if (coins.some((c) => c.source === "dex")) sources.push("dex");
  if (coins.some((c) => c.source === "listed")) sources.push("listed");
  const data: RadarResponse = { coins, asOf: Date.now(), sources };
  cached("radar", 30_000, data);
  return data;
}

type PaprikaSearch = {
  currencies?: {
    id: string;
    name: string;
    symbol: string;
    rank?: number;
    is_active?: boolean;
    contract_address?: { type?: string; address?: string }[];
  }[];
};

type PaprikaCoin = {
  id: string;
  name: string;
  symbol: string;
  description?: string;
  logo?: string;
  links?: { website?: string[] };
  contracts?: { contract?: string; platform?: string }[];
  first_data_at?: string;
};

async function searchListed(q: string): Promise<Coin[]> {
  const result = await fetchJson<PaprikaSearch>(
    `https://api.coinpaprika.com/v1/search/?q=${encodeURIComponent(q)}&c=currencies&limit=8`,
    8000,
  );
  const hits = (result.currencies ?? []).filter((c) => c.is_active !== false).slice(0, 6);
  const tickers = await mapPool(hits, 4, async (h) => {
    try {
      const t = await fetchJson<PaprikaTicker>(
        `https://api.coinpaprika.com/v1/tickers/${h.id}`,
        7000,
      );
      const coin = fromPaprika(t);
      if (!coin) return null;
      const ca = h.contract_address?.[0]?.address;
      if (ca) coin.tokenAddress = ca;
      return coin;
    } catch {
      return null;
    }
  });
  return tickers.filter((c): c is Coin => !!c);
}

async function searchDex(q: string): Promise<Coin[]> {
  const body = await fetchJson<{ pairs?: DexPair[] }>(
    `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`,
    8000,
  );
  const pairs = body.pairs ?? [];
  const best = new Map<string, Coin>();
  for (const p of pairs.slice(0, 40)) {
    const coin = fromDex(p);
    if (!coin) continue;
    const key = coin.tokenAddress?.toLowerCase() ?? coin.id;
    const prev = best.get(key);
    if (!prev || coin.volume24h > prev.volume24h) best.set(key, coin);
  }
  return [...best.values()].sort((a, b) => b.volume24h - a.volume24h).slice(0, 8);
}

async function hydrateListed(id: string): Promise<Coin | null> {
  const paprikaId = id.startsWith("listed:") ? id.slice(7) : id;
  const [ticker, detail] = await Promise.all([
    fetchJson<PaprikaTicker>(`https://api.coinpaprika.com/v1/tickers/${paprikaId}`, 7000),
    fetchJson<PaprikaCoin>(`https://api.coinpaprika.com/v1/coins/${paprikaId}`, 7000).catch(
      () => null,
    ),
  ]);
  const coin = fromPaprika(ticker);
  if (!coin) return null;
  if (detail) {
    coin.description = detail.description ?? coin.description;
    coin.imageUrl = detail.logo ?? coin.imageUrl;
    coin.websites = detail.links?.website ?? [];
    const contract = detail.contracts?.[0]?.contract;
    if (contract) coin.tokenAddress = contract;
    const platform = detail.contracts?.[0]?.platform;
    if (platform) {
      const chain = platform.split("-")[0] ?? platform;
      if (chain && chain !== "listed") {
        coin.chainId = chain === "eth" ? "ethereum" : chain;
        coin.chainLabel = chainLabel(coin.chainId);
      }
    }
  }
  return coin;
}

async function hydrateDex(chainId: string, tokenAddress: string): Promise<Coin | null> {
  const pairs = await fetchJson<DexPair[]>(
    `https://api.dexscreener.com/tokens/v1/${chainId}/${tokenAddress}`,
    8000,
  );
  if (!Array.isArray(pairs) || pairs.length === 0) return null;
  const ranked = [...pairs].sort(
    (a, b) => (num(b.liquidity?.usd) ?? 0) - (num(a.liquidity?.usd) ?? 0),
  );
  return fromDex(ranked[0]!);
}

export const getRadar = createServerFn({ method: "GET" }).handler(async () => {
  return loadRadar();
});

export const searchMarket = createServerFn({ method: "POST" })
  .validator((input: { q: string }) => ({
    q: String(input?.q ?? "").trim().slice(0, 80),
  }))
  .handler(async ({ data }): Promise<{ coins: Coin[] }> => {
    const q = data.q;
    if (!q) return { coins: [] };
    const tasks: Promise<Coin[]>[] = [];
    if (looksLikeAddress(q) || q.length >= 2) {
      tasks.push(searchDex(q).catch(() => []));
    }
    if (!looksLikeAddress(q)) {
      tasks.push(searchListed(q).catch(() => []));
    }
    const parts = await Promise.all(tasks);
    const merged = mergeRadar(parts[0] ?? [], parts[1] ?? []);
    return { coins: merged.slice(0, 12) };
  });

export const hydrateCoin = createServerFn({ method: "POST" })
  .validator((input: { id: string; chainId?: string; tokenAddress?: string }) => input)
  .handler(async ({ data }): Promise<{ coin: Coin | null }> => {
    try {
      if (data.id.startsWith("listed:")) {
        return { coin: await hydrateListed(data.id) };
      }
      if (data.chainId && data.tokenAddress) {
        return { coin: await hydrateDex(data.chainId, data.tokenAddress) };
      }
      return { coin: null };
    } catch {
      return { coin: null };
    }
  });
