export type TapeSource = "dex" | "listed";

export type Coin = {
  id: string;
  source: TapeSource;
  chainId: string;
  chainLabel: string;
  tokenAddress: string | null;
  pairAddress: string | null;
  dexId: string | null;
  url: string | null;
  name: string;
  symbol: string;
  imageUrl: string | null;
  priceUsd: number;
  changeM5: number | null;
  changeH1: number | null;
  changeH6: number | null;
  changeH24: number | null;
  changeD7: number | null;
  volume24h: number;
  buys24h: number | null;
  sells24h: number | null;
  liquidityUsd: number | null;
  marketCap: number | null;
  fdv: number | null;
  pairCreatedAt: number | null;
  listedAt: string | null;
  rank: number | null;
  boosted: number | null;
  description: string | null;
  websites: string[];
};

export type CoinSnap = {
  id: string;
  symbol: string;
  name: string;
  chainLabel: string;
  source: TapeSource;
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
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  scan?: ScanResult | null;
  error?: boolean;
};

export type ScanResult = {
  verdict: string;
  narrative: string;
  risk: "low" | "medium" | "high" | "extreme" | "unknown";
  flags: string[];
  tape: string;
  watch: string;
};

export type RadarResponse = {
  coins: Coin[];
  asOf: number;
  sources: TapeSource[];
};

export type ChatResponse =
  | { ok: true; text: string; scan?: ScanResult | null }
  | { ok: false; error: string };
