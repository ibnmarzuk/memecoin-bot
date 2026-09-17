//#region node_modules/.nitro/vite/services/ssr/assets/format-DuQl3DE9.js
var COMPACT = new Intl.NumberFormat("en-US", {
	notation: "compact",
	maximumFractionDigits: 2
});
function formatUsd(n) {
	if (n == null || !Number.isFinite(n)) return "—";
	if (Math.abs(n) >= 1e3) return `$${COMPACT.format(n)}`;
	if (Math.abs(n) >= 1) return `$${n.toFixed(2)}`;
	if (Math.abs(n) >= .01) return `$${n.toFixed(4)}`;
	if (Math.abs(n) >= 1e-4) return `$${n.toFixed(6)}`;
	return `$${n.toExponential(2)}`;
}
function formatPct(n) {
	if (n == null || !Number.isFinite(n)) return "—";
	const abs = Math.abs(n);
	const body = abs >= 100 ? abs.toFixed(0) : abs.toFixed(2);
	if (n > 0) return `+${body}%`;
	if (n < 0) return `−${body}%`;
	return `${body}%`;
}
function formatAge(isoOrMs) {
	if (isoOrMs == null) return "—";
	const ms = typeof isoOrMs === "number" ? isoOrMs : Date.parse(isoOrMs);
	if (!Number.isFinite(ms)) return "—";
	const delta = Date.now() - ms;
	if (delta < 0) return "new";
	const mins = Math.floor(delta / 6e4);
	if (mins < 60) return `${mins}m`;
	const hours = Math.floor(mins / 60);
	if (hours < 48) return `${hours}h`;
	const days = Math.floor(hours / 24);
	if (days < 90) return `${days}d`;
	const years = Math.floor(days / 365);
	return years >= 1 ? `${years}y` : `${Math.floor(days / 30)}mo`;
}
function heatScore(input) {
	const volN = clamp(Math.log10(Math.max(input.volume24h, 1)) / 9, 0, 1);
	const d24 = clamp(Math.abs(input.changeH24 ?? 0) / 60, 0, 1);
	const d1 = clamp(Math.abs(input.changeH1 ?? 0) / 15, 0, 1);
	const boost = input.boosted && input.boosted > 0 ? .08 : 0;
	return Math.round(100 * clamp(.5 * volN + .32 * d24 + .18 * d1 + boost, 0, 1));
}
function riskFromCoin(coin) {
	const flags = [];
	if (coin.source === "listed") flags.push("Listed tape — not a fresh pool");
	if (coin.liquidityUsd != null && coin.liquidityUsd < 15e3) flags.push("Thin book");
	if (coin.pairCreatedAt) {
		const hours = (Date.now() - coin.pairCreatedAt) / 36e5;
		if (hours < 24) flags.push("Newborn pair");
		else if (hours < 72) flags.push("Young pair");
	}
	if (coin.buys24h != null && coin.sells24h != null) {
		const total = coin.buys24h + coin.sells24h;
		if (total > 20 && coin.sells24h / total > .65) flags.push("Sell-heavy tape");
		if (total > 20 && coin.buys24h / total > .7) flags.push("Buy-heavy tape");
	}
	return flags;
}
function clamp(n, min, max) {
	return Math.min(max, Math.max(min, n));
}
function toSnap(coin) {
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
		rank: coin.rank
	};
}
function shortAddress(addr) {
	if (!addr) return "—";
	if (addr.length <= 12) return addr;
	return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
function looksLikeAddress(q) {
	const s = q.trim();
	if (/^0x[a-fA-F0-9]{40}$/.test(s)) return true;
	if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s)) return true;
	return false;
}
//#endregion
export { looksLikeAddress as a, toSnap as c, heatScore as i, formatPct as n, riskFromCoin as o, formatUsd as r, shortAddress as s, formatAge as t };
