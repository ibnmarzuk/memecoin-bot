import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
import { i as heatScore, n as formatPct, r as formatUsd } from "./format-DuQl3DE9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-DQZB0Vp8.js
function riskFromSnap(focus) {
	const flags = [];
	const mcap = focus.marketCap ?? 0;
	const liq = focus.liquidityUsd;
	let risk = "medium";
	if (focus.source === "listed") {
		flags.push("Listed tape — not a fresh pool");
		if (mcap >= 1e9) {
			risk = "low";
			flags.push("Large-cap meme");
		} else if (mcap >= 8e7) risk = "medium";
		else if (mcap > 0) {
			risk = "high";
			flags.push("Small listed cap");
		}
	} else if (liq != null) {
		if (liq < 8e3) {
			risk = "extreme";
			flags.push("Thin book");
		} else if (liq < 25e3) {
			risk = "high";
			flags.push("Thin book");
		} else if (liq < 8e4) {
			risk = "medium";
			flags.push("Modest liquidity");
		}
	}
	if (focus.boosted && focus.boosted > 0) flags.push("Paid boosts — ads, not demand");
	if (focus.buys24h != null && focus.sells24h != null) {
		const total = focus.buys24h + focus.sells24h;
		if (total > 20 && focus.sells24h / total > .65) flags.push("Sell-heavy tape");
		if (total > 20 && focus.buys24h / total > .7) flags.push("Buy-heavy tape");
	}
	const ch = focus.changeH24;
	if (ch != null && ch <= -40) flags.push("Heavy 24h drawdown");
	if (ch != null && ch >= 80) flags.push("Parabolic 24h print");
	return {
		risk,
		flags: flags.slice(0, 6)
	};
}
function localScan(focus) {
	const { risk, flags } = riskFromSnap(focus);
	const heat = heatScore(focus);
	const ch24 = formatPct(focus.changeH24);
	const vol = formatUsd(focus.volume24h);
	const mcap = formatUsd(focus.marketCap);
	const liq = focus.liquidityUsd != null ? formatUsd(focus.liquidityUsd) : "not on a pool tape";
	const established = focus.source === "listed" && (focus.marketCap ?? 0) >= 1e9;
	const verdict = established ? `${focus.symbol} is a mature meme with real tape — still a joke coin, not a cash-flow asset.` : focus.source === "listed" ? `${focus.symbol} is listed, not a newborn pool. Treat the 24h print (${ch24}) as positioning, not destiny.` : `${focus.symbol} is a live DEX meme. Heat ${heat}/100. Book ${liq}. Do not confuse a spike with a business.`;
	const narrative = established ? `${focus.name} is a long-running internet joke with a liquid market. The “story” is culture and attention, not revenue. Rank ${focus.rank ?? "—"} does not make it safe — it makes it easier to exit than a 12-hour Solana mint.` : `${focus.name} trades as a ${focus.chainLabel} meme. Narrative here is marketing. Paid boosts, if any, buy a billboard. The only fundamentals are liquidity, age, and whether sellers already own the tape.`;
	const tapeParts = [
		`Price ${formatUsd(focus.priceUsd)}`,
		`24h ${ch24}`,
		`1h ${formatPct(focus.changeH1)}`,
		`volume ${vol}`,
		`mcap ${mcap}`,
		`liq ${liq}`
	];
	if (focus.buys24h != null && focus.sells24h != null) tapeParts.push(`${focus.buys24h} buys / ${focus.sells24h} sells`);
	if (focus.boosted) tapeParts.push(`${focus.boosted} active boosts`);
	const watch = established ? "A break in liquidity or a multi-day volume collapse would change the read. Until then this is a liquid meme, not a startup." : liq === "not on a pool tape" ? "Get a pool with visible liquidity before treating prints as tradable. Watch 1h vs 24h divergence." : "Watch the book. If liquidity vanishes or the tape flips one-sided, the story is over. Boosts expiring is noise.";
	return {
		verdict,
		narrative,
		risk,
		flags,
		tape: tapeParts.join(" · "),
		watch
	};
}
function movers(snapshot) {
	if (!snapshot.length) return "The radar is empty on this pass. Search a ticker or wait for the tape to refill. Not financial advice.";
	return [
		"What is moving is not what is “good”. It is what printed.",
		...[...snapshot].sort((a, b) => Math.abs(b.changeH24 ?? 0) - Math.abs(a.changeH24 ?? 0)).slice(0, 5).map((c) => {
			const tag = (c.changeH24 ?? 0) >= 0 ? "bid" : "offer";
			return `${c.symbol} ${formatPct(c.changeH24)} 24h, vol ${formatUsd(c.volume24h)} (${tag}, ${c.chainLabel})`;
		}).map((l) => `— ${l}`),
		"Boosted names are ads. Thin books can print cartoon percentages and still be unsellable. Meme coins can go to zero. Not financial advice."
	].join("\n");
}
function readOn(focus) {
	const scan = localScan(focus);
	return [
		`${focus.symbol} — ${scan.verdict}`,
		scan.tape,
		scan.flags.length ? `Flags: ${scan.flags.join("; ")}.` : null,
		scan.watch,
		"Not financial advice. Meme coins can go to zero."
	].filter(Boolean).join("\n\n");
}
function localChat(user, snapshot, focus) {
	const q = user.toLowerCase();
	if (/\b(rug|honeypot|scam|drain)\b/.test(q)) return [
		"A rug is usually visible in the book, not in the meme.",
		"— Newborn pair and a tiny book is the default crime scene.",
		"— Sell-heavy tape while the chart still “looks green” is distribution.",
		"— No site, no pool depth, paid boosts only: you are looking at a billboard.",
		"— Renounced or not, if you cannot exit size, you do not have a market.",
		"None of that is a buy or a pass. It is how you read a crime novel. Meme coins can go to zero. Not financial advice."
	].join("\n");
	if (/\b(volume|vol)\b/.test(q) && /\b(mcap|market cap|liquidity|book|liq)\b/.test(q)) return [
		"Volume is how much changed hands. Market cap is price times supply — a headline, not cash.",
		"Liquidity is whether you can actually exit. A $20m “mcap” on a $4k book is a screenshot, not a market.",
		`High vol / thin book is a slot machine.${focus ? ` On ${focus.symbol}: vol ${formatUsd(focus.volume24h)} vs mcap ${formatUsd(focus.marketCap)}${focus.liquidityUsd != null ? ` vs book ${formatUsd(focus.liquidityUsd)}` : ""}.` : ""}`,
		"Not financial advice."
	].join("\n\n");
	if (/\b(rule|how do you|desk rules|how (should|do) i read)\b/.test(q)) return [
		"Desk rules, short:",
		"— Boosts are ads. Ignore the golden ticker.",
		"— Age and liquidity first. Narrative last.",
		"— One-sided tape is a fact. “Community” is a press release.",
		"— If you cannot name the exit, you do not have a trade. I still will not tell you to take one.",
		"Meme coins can go to zero. Not financial advice."
	].join("\n");
	if (/\b(moving|pump|hot|what's on the tape|whats on the tape|radar)\b/.test(q)) return movers(snapshot);
	if (focus) return readOn(focus);
	if (snapshot.length) return movers(snapshot);
	return "Pin a coin on the tape or search a ticker and I will read the numbers. I do not pick winners. Not financial advice.";
}
var MODEL = "grok-4.5";
var MAX_CONTENT = 4e3;
var SYSTEM = `You are FREN, the desk analyst at a meme-coin wire service.
Voice: dry, precise, slightly sarcastic, never breathless. No emoji. No hashtags.
You never tell anyone to buy, sell, ape, or hold. You do not give financial advice.
Paid DexScreener boosts are advertising, not demand. Treat them as such.
You flag thin liquidity, newborn pairs, one-sided tape, missing socials, and narrative-only coins.
Memes are marketing, not cash flow. Say so plainly.
When live numbers are provided, ground every claim in those numbers. If data is missing, say so.
Keep answers tight: 2–4 short paragraphs or a short dash list. No markdown tables.
If the user asks you to scan, still stay in this voice.
Always remind, once, that meme coins can go to zero and this is not financial advice — but do not end every single short reply with a lecture if you already said it in the thread.`;
var windowStart = 0;
var windowCount = 0;
var WINDOW_MS = 6e4;
var WINDOW_CAP = 20;
var apiBlockedUntil = 0;
var scanCache = /* @__PURE__ */ new Map();
function rateLimit() {
	const now = Date.now();
	if (now - windowStart > WINDOW_MS) {
		windowStart = now;
		windowCount = 0;
	}
	if (windowCount >= WINDOW_CAP) return "The desk is busy. Try again in a minute.";
	windowCount += 1;
	return null;
}
function snapLine(s) {
	const parts = [
		`${s.symbol} (${s.name})`,
		s.chainLabel,
		s.source,
		`px ${formatUsd(s.priceUsd)}`,
		`1h ${formatPct(s.changeH1)}`,
		`24h ${formatPct(s.changeH24)}`,
		`vol ${formatUsd(s.volume24h)}`
	];
	if (s.marketCap != null) parts.push(`mcap ${formatUsd(s.marketCap)}`);
	if (s.liquidityUsd != null) parts.push(`liq ${formatUsd(s.liquidityUsd)}`);
	if (s.buys24h != null && s.sells24h != null) parts.push(`tape ${s.buys24h}b/${s.sells24h}s`);
	if (s.boosted) parts.push(`boosts ${s.boosted}`);
	if (s.rank) parts.push(`rank ${s.rank}`);
	return parts.join(" · ");
}
function cacheKey(focus) {
	return [
		focus.id,
		Math.round(focus.priceUsd * 1e8),
		Math.round(focus.changeH24 ?? 0),
		Math.round(focus.volume24h)
	].join(":");
}
async function grok(messages, maxTokens) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "local"
	};
	if (Date.now() < apiBlockedUntil) return {
		ok: false,
		error: "local"
	};
	const limited = rateLimit();
	if (limited) return {
		ok: false,
		error: limited
	};
	const payload = {
		model: MODEL,
		temperature: .55,
		max_tokens: maxTokens,
		messages
	};
	const attempt = async () => {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify(payload),
			signal: AbortSignal.timeout(45e3)
		});
		if (!res.ok) {
			await res.text().catch(() => "");
			if (res.status === 401 || res.status === 403) {
				apiBlockedUntil = Date.now() + 9e5;
				return {
					ok: false,
					error: "local"
				};
			}
			return {
				ok: false,
				error: `Desk error ${res.status}`
			};
		}
		const text = (await res.json()).choices?.[0]?.message?.content?.trim() ?? "";
		if (!text) return {
			ok: false,
			error: "local"
		};
		return {
			ok: true,
			text
		};
	};
	try {
		const first = await attempt();
		if (first.ok) return first;
		if (first.error === "local") return first;
		if (first.error?.includes("429") || first.error?.includes("50")) {
			await new Promise((r) => setTimeout(r, 600));
			const retry = await attempt();
			if (retry.ok || retry.error === "local") return retry;
		}
		return {
			ok: false,
			error: "local"
		};
	} catch {
		return {
			ok: false,
			error: "local"
		};
	}
}
function parseScan(text) {
	const fenced = text.match(/\{[\s\S]*\}/);
	if (!fenced) return null;
	try {
		const raw = JSON.parse(fenced[0]);
		const riskRaw = String(raw.risk ?? "unknown").toLowerCase();
		const risk = riskRaw === "low" || riskRaw === "medium" || riskRaw === "high" || riskRaw === "extreme" ? riskRaw : "unknown";
		const flags = Array.isArray(raw.flags) ? raw.flags.map((f) => String(f)).filter(Boolean).slice(0, 6) : [];
		return {
			verdict: String(raw.verdict ?? "").slice(0, 240) || "No verdict.",
			narrative: String(raw.narrative ?? "").slice(0, 800) || "—",
			risk,
			flags,
			tape: String(raw.tape ?? "").slice(0, 400) || "—",
			watch: String(raw.watch ?? "").slice(0, 400) || "—"
		};
	} catch {
		return null;
	}
}
var chatDesk_createServerFn_handler = createServerRpc({
	id: "75576047554d5634ba7813f52f579b4c6cb0db5e15fc648a3e1a673db09c3c13",
	name: "chatDesk",
	filename: "src/lib/ai.ts"
}, (opts) => chatDesk.__executeServer(opts));
var chatDesk = createServerFn({ method: "POST" }).validator((input) => ({
	messages: (input.messages ?? []).slice(-8).map((m) => ({
		role: m.role === "assistant" ? "assistant" : "user",
		content: String(m.content ?? "").slice(0, MAX_CONTENT)
	})).filter((m) => m.content.trim()),
	snapshot: (input.snapshot ?? []).slice(0, 8),
	focus: input.focus ?? null
})).handler(chatDesk_createServerFn_handler, async ({ data }) => {
	if (data.messages.length === 0) return {
		ok: false,
		error: "Ask the desk something first."
	};
	const lastUser = [...data.messages].reverse().find((m) => m.role === "user")?.content ?? "";
	const fallback = () => ({
		ok: true,
		text: localChat(lastUser, data.snapshot, data.focus)
	});
	const context = [];
	if (data.focus) context.push(`Pinned coin:\n${snapLine(data.focus)}`);
	if (data.snapshot.length) context.push(`Live radar (not a recommendation):\n${data.snapshot.map((s) => `- ${snapLine(s)}`).join("\n")}`);
	const result = await grok([
		{
			role: "system",
			content: SYSTEM
		},
		...context.length ? [{
			role: "system",
			content: context.join("\n\n")
		}] : [],
		...data.messages.map((m) => ({
			role: m.role,
			content: m.content
		}))
	], 700);
	if (result.ok) return result;
	return fallback();
});
var scanDesk_createServerFn_handler = createServerRpc({
	id: "fa837041f2a2bbbd57e52a15440d58d3c6ef19be53614f8bdb1b39834c2a0e67",
	name: "scanDesk",
	filename: "src/lib/ai.ts"
}, (opts) => scanDesk.__executeServer(opts));
var scanDesk = createServerFn({ method: "POST" }).validator((input) => ({
	focus: input.focus,
	extra: input.extra ? String(input.extra).slice(0, 1200) : null
})).handler(scanDesk_createServerFn_handler, async ({ data }) => {
	const key = cacheKey(data.focus);
	const hit = scanCache.get(key);
	if (hit && Date.now() - hit.at < 12e4) return hit.result;
	const fallbackScan = () => {
		const scan = localScan(data.focus);
		return {
			ok: true,
			text: scan.verdict,
			scan
		};
	};
	const result = await grok([{
		role: "system",
		content: SYSTEM
	}, {
		role: "user",
		content: `Scan this meme coin for the desk. Return ONLY a JSON object with keys:
verdict (one sentence),
narrative (2-3 sentences on the story / why it exists),
risk (low|medium|high|extreme),
flags (array of short strings),
tape (what the volume / mcap / liquidity / buys-sells actually say),
watch (what would change the read).
No markdown. No extra keys.

Coin:
${snapLine(data.focus)}
${data.extra ? `\nNotes:\n${data.extra}` : ""}`
	}], 650);
	if (!result.ok) {
		const local = fallbackScan();
		scanCache.set(key, {
			at: Date.now(),
			result: local
		});
		return local;
	}
	const scan = parseScan(result.text) ?? localScan(data.focus);
	const out = {
		ok: true,
		text: scan.verdict,
		scan
	};
	scanCache.set(key, {
		at: Date.now(),
		result: out
	});
	return out;
});
//#endregion
export { chatDesk_createServerFn_handler, scanDesk_createServerFn_handler };
