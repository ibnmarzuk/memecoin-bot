import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
import { n as formatPct, r as formatUsd } from "./format-DuQl3DE9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-fT55Bu69.js
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
async function grok(messages, maxTokens) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "AI is not available in this environment."
	};
	const limited = rateLimit();
	if (limited) return {
		ok: false,
		error: limited
	};
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: MODEL,
			temperature: .55,
			max_tokens: maxTokens,
			messages
		}),
		signal: AbortSignal.timeout(45e3)
	});
	if (!res.ok) return {
		ok: false,
		error: `Desk error ${res.status}. Try again.`
	};
	const text = (await res.json()).choices?.[0]?.message?.content?.trim() ?? "";
	if (!text) return {
		ok: false,
		error: "The desk went quiet. Try again."
	};
	return {
		ok: true,
		text
	};
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
	const context = [];
	if (data.focus) context.push(`Pinned coin:\n${snapLine(data.focus)}`);
	if (data.snapshot.length) context.push(`Live radar (not a recommendation):\n${data.snapshot.map((s) => `- ${snapLine(s)}`).join("\n")}`);
	return grok([
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
	if (!result.ok) return result;
	const scan = parseScan(result.text);
	if (!scan) return {
		ok: true,
		text: result.text,
		scan: {
			verdict: result.text.slice(0, 220),
			narrative: result.text,
			risk: "unknown",
			flags: [],
			tape: "Could not parse a structured tape read.",
			watch: "Ask a follow-up."
		}
	};
	return {
		ok: true,
		text: scan.verdict,
		scan
	};
});
//#endregion
export { chatDesk_createServerFn_handler, scanDesk_createServerFn_handler };
