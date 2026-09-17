import { createServerFn } from "@tanstack/react-start";
import type { ChatResponse, CoinSnap, ScanResult } from "@/lib/types";
import { formatPct, formatUsd } from "@/lib/format";
import { localChat, localScan } from "@/lib/desk-analyst";

const MODEL = "grok-4.5";
const MAX_HISTORY = 8;
const MAX_CONTENT = 4000;

const SYSTEM = `You are FREN, the desk analyst at a meme-coin wire service.
Voice: dry, precise, slightly sarcastic, never breathless. No emoji. No hashtags.
You never tell anyone to buy, sell, ape, or hold. You do not give financial advice.
Paid DexScreener boosts are advertising, not demand. Treat them as such.
You flag thin liquidity, newborn pairs, one-sided tape, missing socials, and narrative-only coins.
Memes are marketing, not cash flow. Say so plainly.
When live numbers are provided, ground every claim in those numbers. If data is missing, say so.
Keep answers tight: 2–4 short paragraphs or a short dash list. No markdown tables.
If the user asks you to scan, still stay in this voice.
Always remind, once, that meme coins can go to zero and this is not financial advice — but do not end every single short reply with a lecture if you already said it in the thread.`;

type GrokMsg = { role: "system" | "user" | "assistant"; content: string };

let windowStart = 0;
let windowCount = 0;
const WINDOW_MS = 60_000;
const WINDOW_CAP = 20;
let apiBlockedUntil = 0;

const scanCache = new Map<string, { at: number; result: ChatResponse }>();

function rateLimit(): string | null {
  const now = Date.now();
  if (now - windowStart > WINDOW_MS) {
    windowStart = now;
    windowCount = 0;
  }
  if (windowCount >= WINDOW_CAP) return "The desk is busy. Try again in a minute.";
  windowCount += 1;
  return null;
}

function snapLine(s: CoinSnap): string {
  const parts = [
    `${s.symbol} (${s.name})`,
    s.chainLabel,
    s.source,
    `px ${formatUsd(s.priceUsd)}`,
    `1h ${formatPct(s.changeH1)}`,
    `24h ${formatPct(s.changeH24)}`,
    `vol ${formatUsd(s.volume24h)}`,
  ];
  if (s.marketCap != null) parts.push(`mcap ${formatUsd(s.marketCap)}`);
  if (s.liquidityUsd != null) parts.push(`liq ${formatUsd(s.liquidityUsd)}`);
  if (s.buys24h != null && s.sells24h != null) parts.push(`tape ${s.buys24h}b/${s.sells24h}s`);
  if (s.boosted) parts.push(`boosts ${s.boosted}`);
  if (s.rank) parts.push(`rank ${s.rank}`);
  return parts.join(" · ");
}

function cacheKey(focus: CoinSnap): string {
  return [
    focus.id,
    Math.round(focus.priceUsd * 1e8),
    Math.round(focus.changeH24 ?? 0),
    Math.round(focus.volume24h),
  ].join(":");
}

async function grok(messages: GrokMsg[], maxTokens: number): Promise<ChatResponse> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { ok: false, error: "local" };
  if (Date.now() < apiBlockedUntil) return { ok: false, error: "local" };

  const limited = rateLimit();
  if (limited) return { ok: false, error: limited };

  const payload = {
    model: MODEL,
    temperature: 0.55,
    max_tokens: maxTokens,
    messages,
  };

  const attempt = async (): Promise<ChatResponse> => {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(45_000),
    });

    if (!res.ok) {
      await res.text().catch(() => "");
      if (res.status === 401 || res.status === 403) {
        apiBlockedUntil = Date.now() + 15 * 60_000;
        return { ok: false, error: "local" };
      }
      return { ok: false, error: `Desk error ${res.status}` };
    }

    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = body.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { ok: false, error: "local" };
    return { ok: true, text };
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
    return { ok: false, error: "local" };
  } catch {
    return { ok: false, error: "local" };
  }
}

function parseScan(text: string): ScanResult | null {
  const fenced = text.match(/\{[\s\S]*\}/);
  if (!fenced) return null;
  try {
    const raw = JSON.parse(fenced[0]) as Record<string, unknown>;
    const riskRaw = String(raw.risk ?? "unknown").toLowerCase();
    const risk: ScanResult["risk"] =
      riskRaw === "low" ||
      riskRaw === "medium" ||
      riskRaw === "high" ||
      riskRaw === "extreme"
        ? riskRaw
        : "unknown";
    const flags = Array.isArray(raw.flags)
      ? raw.flags.map((f) => String(f)).filter(Boolean).slice(0, 6)
      : [];
    return {
      verdict: String(raw.verdict ?? "").slice(0, 240) || "No verdict.",
      narrative: String(raw.narrative ?? "").slice(0, 800) || "—",
      risk,
      flags,
      tape: String(raw.tape ?? "").slice(0, 400) || "—",
      watch: String(raw.watch ?? "").slice(0, 400) || "—",
    };
  } catch {
    return null;
  }
}

export const chatDesk = createServerFn({ method: "POST" })
  .validator(
    (input: {
      messages: { role: "user" | "assistant"; content: string }[];
      snapshot?: CoinSnap[];
      focus?: CoinSnap | null;
    }) => ({
      messages: (input.messages ?? [])
        .slice(-MAX_HISTORY)
        .map((m) => ({
          role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: String(m.content ?? "").slice(0, MAX_CONTENT),
        }))
        .filter((m) => m.content.trim()),
      snapshot: (input.snapshot ?? []).slice(0, 8),
      focus: input.focus ?? null,
    }),
  )
  .handler(async ({ data }): Promise<ChatResponse> => {
    if (data.messages.length === 0) {
      return { ok: false, error: "Ask the desk something first." };
    }

    const lastUser = [...data.messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const fallback = (): ChatResponse => ({
      ok: true,
      text: localChat(lastUser, data.snapshot, data.focus),
    });

    const context: string[] = [];
    if (data.focus) context.push(`Pinned coin:\n${snapLine(data.focus)}`);
    if (data.snapshot.length) {
      context.push(
        `Live radar (not a recommendation):\n${data.snapshot.map((s) => `- ${snapLine(s)}`).join("\n")}`,
      );
    }

    const messages: GrokMsg[] = [
      { role: "system", content: SYSTEM },
      ...(context.length
        ? [{ role: "system" as const, content: context.join("\n\n") }]
        : []),
      ...data.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const result = await grok(messages, 700);
    if (result.ok) return result;
    return fallback();
  });

export const scanDesk = createServerFn({ method: "POST" })
  .validator((input: { focus: CoinSnap; extra?: string | null }) => ({
    focus: input.focus,
    extra: input.extra ? String(input.extra).slice(0, 1200) : null,
  }))
  .handler(async ({ data }): Promise<ChatResponse> => {
    const key = cacheKey(data.focus);
    const hit = scanCache.get(key);
    if (hit && Date.now() - hit.at < 120_000) return hit.result;

    const fallbackScan = (): ChatResponse => {
      const scan = localScan(data.focus);
      return { ok: true, text: scan.verdict, scan };
    };

    const messages: GrokMsg[] = [
      { role: "system", content: SYSTEM },
      {
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
${data.extra ? `\nNotes:\n${data.extra}` : ""}`,
      },
    ];
    const result = await grok(messages, 650);
    if (!result.ok) {
      const local = fallbackScan();
      scanCache.set(key, { at: Date.now(), result: local });
      return local;
    }
    const parsed = parseScan(result.text);
    const scan = parsed ?? localScan(data.focus);
    const out: ChatResponse = { ok: true, text: scan.verdict, scan };
    scanCache.set(key, { at: Date.now(), result: out });
    return out;
  });
