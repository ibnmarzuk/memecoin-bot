import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
import { a as looksLikeAddress } from "./format-DuQl3DE9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market-DmdjlHVD.js
var DESK_UNIVERSE = [
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
	"npc-non-playable-coin"
];
var CHAIN_LABEL = {
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
	"pulsechain": "Pulse"
};
var cache = /* @__PURE__ */ new Map();
function cached(key, ttl, data) {
	if (data) cache.set(key, {
		at: Date.now(),
		data
	});
	const hit = cache.get(key);
	if (!hit) return null;
	if (Date.now() - hit.at > ttl) return null;
	return hit.data;
}
async function fetchJson(url, timeoutMs = 8e3) {
	const res = await fetch(url, {
		headers: {
			Accept: "application/json",
			"User-Agent": "FRENDesk/1.0"
		},
		signal: AbortSignal.timeout(timeoutMs)
	});
	if (!res.ok) throw new Error(`upstream ${res.status}`);
	return await res.json();
}
async function mapPool(items, concurrency, fn) {
	const out = new Array(items.length);
	let cursor = 0;
	async function worker() {
		while (cursor < items.length) {
			const i = cursor++;
			out[i] = await fn(items[i]);
		}
	}
	const n = Math.min(concurrency, items.length);
	await Promise.all(Array.from({ length: n }, worker));
	return out;
}
function num(v) {
	if (typeof v === "number" && Number.isFinite(v)) return v;
	if (typeof v === "string" && v.trim()) {
		const n = Number(v);
		return Number.isFinite(n) ? n : null;
	}
	return null;
}
function chainLabel(id) {
	return CHAIN_LABEL[id] ?? id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function fromPaprika(t) {
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
		websites: []
	};
}
var SKIP_SYMBOLS = /* @__PURE__ */ new Set([
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
	"WBNB"
]);
function fromDex(p) {
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
		websites: (p.info?.websites ?? []).map((w) => w.url).filter((u) => !!u)
	};
}
async function fetchDexRadar() {
	const boosts = await fetchJson("https://api.dexscreener.com/token-boosts/top/v1", 7e3);
	if (!Array.isArray(boosts) || boosts.length === 0) return [];
	const byChain = /* @__PURE__ */ new Map();
	const boostMap = /* @__PURE__ */ new Map();
	for (const b of boosts) {
		if (!b.chainId || !b.tokenAddress) continue;
		const list = byChain.get(b.chainId) ?? [];
		if (!list.includes(b.tokenAddress)) list.push(b.tokenAddress);
		byChain.set(b.chainId, list);
		boostMap.set(`${b.chainId}:${b.tokenAddress}`.toLowerCase(), b);
	}
	const coins = [];
	await mapPool([...byChain.entries()], 4, async ([chain, addrs]) => {
		const chunk = addrs.slice(0, 30);
		try {
			const pairs = await fetchJson(`https://api.dexscreener.com/tokens/v1/${chain}/${chunk.join(",")}`, 8e3);
			if (!Array.isArray(pairs)) return;
			const best = /* @__PURE__ */ new Map();
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
		} catch {}
	});
	return coins.sort((a, b) => b.volume24h - a.volume24h).slice(0, 28);
}
async function fetchListedRadar() {
	return (await mapPool(DESK_UNIVERSE, 6, async (id) => {
		try {
			return await fetchJson(`https://api.coinpaprika.com/v1/tickers/${id}`, 7e3);
		} catch {
			return null;
		}
	})).map((t) => t ? fromPaprika(t) : null).filter((c) => !!c).sort((a, b) => b.volume24h - a.volume24h);
}
function mergeRadar(dex, listed) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const c of [...dex, ...listed]) {
		const key = c.symbol.toUpperCase();
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(c);
	}
	return out.slice(0, 32);
}
async function loadRadar() {
	const hit = cached("radar", 3e4, null);
	if (hit) return hit;
	const dexP = fetchDexRadar().catch(() => []);
	const listedP = fetchListedRadar().catch(() => []);
	const dex = await dexP;
	const listedWait = dex.length >= 8 ? 2e3 : 8e3;
	const coins = mergeRadar(dex, await Promise.race([listedP, new Promise((resolve) => setTimeout(() => resolve([]), listedWait))]));
	const sources = [];
	if (coins.some((c) => c.source === "dex")) sources.push("dex");
	if (coins.some((c) => c.source === "listed")) sources.push("listed");
	const data = {
		coins,
		asOf: Date.now(),
		sources
	};
	cached("radar", 3e4, data);
	return data;
}
async function searchListed(q) {
	return (await mapPool(((await fetchJson(`https://api.coinpaprika.com/v1/search/?q=${encodeURIComponent(q)}&c=currencies&limit=8`, 8e3)).currencies ?? []).filter((c) => c.is_active !== false).slice(0, 6), 4, async (h) => {
		try {
			const coin = fromPaprika(await fetchJson(`https://api.coinpaprika.com/v1/tickers/${h.id}`, 7e3));
			if (!coin) return null;
			const ca = h.contract_address?.[0]?.address;
			if (ca) coin.tokenAddress = ca;
			return coin;
		} catch {
			return null;
		}
	})).filter((c) => !!c);
}
async function searchDex(q) {
	const pairs = (await fetchJson(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`, 8e3)).pairs ?? [];
	const best = /* @__PURE__ */ new Map();
	for (const p of pairs.slice(0, 40)) {
		const coin = fromDex(p);
		if (!coin) continue;
		const key = coin.tokenAddress?.toLowerCase() ?? coin.id;
		const prev = best.get(key);
		if (!prev || coin.volume24h > prev.volume24h) best.set(key, coin);
	}
	return [...best.values()].sort((a, b) => b.volume24h - a.volume24h).slice(0, 8);
}
async function hydrateListed(id) {
	const paprikaId = id.startsWith("listed:") ? id.slice(7) : id;
	const [ticker, detail] = await Promise.all([fetchJson(`https://api.coinpaprika.com/v1/tickers/${paprikaId}`, 7e3), fetchJson(`https://api.coinpaprika.com/v1/coins/${paprikaId}`, 7e3).catch(() => null)]);
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
async function hydrateDex(chainId, tokenAddress) {
	const pairs = await fetchJson(`https://api.dexscreener.com/tokens/v1/${chainId}/${tokenAddress}`, 8e3);
	if (!Array.isArray(pairs) || pairs.length === 0) return null;
	return fromDex([...pairs].sort((a, b) => (num(b.liquidity?.usd) ?? 0) - (num(a.liquidity?.usd) ?? 0))[0]);
}
var getRadar_createServerFn_handler = createServerRpc({
	id: "a529dd505c7d89ed0070e523e8993d8c31dbd33c0837e1ec0acef082b375f161",
	name: "getRadar",
	filename: "src/lib/market.ts"
}, (opts) => getRadar.__executeServer(opts));
var getRadar = createServerFn({ method: "GET" }).handler(getRadar_createServerFn_handler, async () => {
	return loadRadar();
});
var searchMarket_createServerFn_handler = createServerRpc({
	id: "0a7cc0de19883550f6fa813f930a4faad3d92a5b281b7f88ec4cbf0dbcaa9af2",
	name: "searchMarket",
	filename: "src/lib/market.ts"
}, (opts) => searchMarket.__executeServer(opts));
var searchMarket = createServerFn({ method: "POST" }).validator((input) => ({ q: String(input?.q ?? "").trim().slice(0, 80) })).handler(searchMarket_createServerFn_handler, async ({ data }) => {
	const q = data.q;
	if (!q) return { coins: [] };
	const tasks = [];
	if (looksLikeAddress(q) || q.length >= 2) tasks.push(searchDex(q).catch(() => []));
	if (!looksLikeAddress(q)) tasks.push(searchListed(q).catch(() => []));
	const parts = await Promise.all(tasks);
	return { coins: mergeRadar(parts[0] ?? [], parts[1] ?? []).slice(0, 12) };
});
var hydrateCoin_createServerFn_handler = createServerRpc({
	id: "3e4da6416916b692642028d6cb7bb1fa007a7dbcbeebc52f8232f4078a28e26f",
	name: "hydrateCoin",
	filename: "src/lib/market.ts"
}, (opts) => hydrateCoin.__executeServer(opts));
var hydrateCoin = createServerFn({ method: "POST" }).validator((input) => input).handler(hydrateCoin_createServerFn_handler, async ({ data }) => {
	try {
		if (data.id.startsWith("listed:")) return { coin: await hydrateListed(data.id) };
		if (data.chainId && data.tokenAddress) return { coin: await hydrateDex(data.chainId, data.tokenAddress) };
		return { coin: null };
	} catch {
		return { coin: null };
	}
});
//#endregion
export { getRadar_createServerFn_handler, hydrateCoin_createServerFn_handler, searchMarket_createServerFn_handler };
