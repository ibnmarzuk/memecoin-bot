import type { CoinSnap, ScanResult } from "@/lib/types";
import { formatPct, formatUsd, heatScore } from "@/lib/format";

function riskFromSnap(focus: CoinSnap): { risk: ScanResult["risk"]; flags: string[] } {
  const flags: string[] = [];
  const mcap = focus.marketCap ?? 0;
  const liq = focus.liquidityUsd;
  let risk: ScanResult["risk"] = "medium";

  if (focus.source === "listed") {
    flags.push("Listed tape — not a fresh pool");
    if (mcap >= 1_000_000_000) {
      risk = "low";
      flags.push("Large-cap meme");
    } else if (mcap >= 80_000_000) {
      risk = "medium";
    } else if (mcap > 0) {
      risk = "high";
      flags.push("Small listed cap");
    }
  } else if (liq != null) {
    if (liq < 8_000) {
      risk = "extreme";
      flags.push("Thin book");
    } else if (liq < 25_000) {
      risk = "high";
      flags.push("Thin book");
    } else if (liq < 80_000) {
      risk = "medium";
      flags.push("Modest liquidity");
    }
  }

  if (focus.boosted && focus.boosted > 0) flags.push("Paid boosts — ads, not demand");

  if (focus.buys24h != null && focus.sells24h != null) {
    const total = focus.buys24h + focus.sells24h;
    if (total > 20 && focus.sells24h / total > 0.65) flags.push("Sell-heavy tape");
    if (total > 20 && focus.buys24h / total > 0.7) flags.push("Buy-heavy tape");
  }

  const ch = focus.changeH24;
  if (ch != null && ch <= -40) flags.push("Heavy 24h drawdown");
  if (ch != null && ch >= 80) flags.push("Parabolic 24h print");

  return { risk, flags: flags.slice(0, 6) };
}

export function localScan(focus: CoinSnap): ScanResult {
  const { risk, flags } = riskFromSnap(focus);
  const heat = heatScore(focus);
  const ch24 = formatPct(focus.changeH24);
  const vol = formatUsd(focus.volume24h);
  const mcap = formatUsd(focus.marketCap);
  const liq =
    focus.liquidityUsd != null ? formatUsd(focus.liquidityUsd) : "not on a pool tape";

  const established = focus.source === "listed" && (focus.marketCap ?? 0) >= 1_000_000_000;
  const verdict = established
    ? `${focus.symbol} is a mature meme with real tape — still a joke coin, not a cash-flow asset.`
    : focus.source === "listed"
      ? `${focus.symbol} is listed, not a newborn pool. Treat the 24h print (${ch24}) as positioning, not destiny.`
      : `${focus.symbol} is a live DEX meme. Heat ${heat}/100. Book ${liq}. Do not confuse a spike with a business.`;

  const narrative = established
    ? `${focus.name} is a long-running internet joke with a liquid market. The “story” is culture and attention, not revenue. Rank ${focus.rank ?? "—"} does not make it safe — it makes it easier to exit than a 12-hour Solana mint.`
    : `${focus.name} trades as a ${focus.chainLabel} meme. Narrative here is marketing. Paid boosts, if any, buy a billboard. The only fundamentals are liquidity, age, and whether sellers already own the tape.`;

  const tapeParts = [
    `Price ${formatUsd(focus.priceUsd)}`,
    `24h ${ch24}`,
    `1h ${formatPct(focus.changeH1)}`,
    `volume ${vol}`,
    `mcap ${mcap}`,
    `liq ${liq}`,
  ];
  if (focus.buys24h != null && focus.sells24h != null) {
    tapeParts.push(`${focus.buys24h} buys / ${focus.sells24h} sells`);
  }
  if (focus.boosted) tapeParts.push(`${focus.boosted} active boosts`);

  const watch = established
    ? "A break in liquidity or a multi-day volume collapse would change the read. Until then this is a liquid meme, not a startup."
    : liq === "not on a pool tape"
      ? "Get a pool with visible liquidity before treating prints as tradable. Watch 1h vs 24h divergence."
      : "Watch the book. If liquidity vanishes or the tape flips one-sided, the story is over. Boosts expiring is noise.";

  return {
    verdict,
    narrative,
    risk,
    flags,
    tape: tapeParts.join(" · "),
    watch,
  };
}

function movers(snapshot: CoinSnap[]): string {
  if (!snapshot.length) {
    return "The radar is empty on this pass. Search a ticker or wait for the tape to refill. Not financial advice.";
  }
  const ranked = [...snapshot].sort(
    (a, b) => Math.abs(b.changeH24 ?? 0) - Math.abs(a.changeH24 ?? 0),
  );
  const lines = ranked.slice(0, 5).map((c) => {
    const tag = (c.changeH24 ?? 0) >= 0 ? "bid" : "offer";
    return `${c.symbol} ${formatPct(c.changeH24)} 24h, vol ${formatUsd(c.volume24h)} (${tag}, ${c.chainLabel})`;
  });
  return [
    "What is moving is not what is “good”. It is what printed.",
    ...lines.map((l) => `— ${l}`),
    "Boosted names are ads. Thin books can print cartoon percentages and still be unsellable. Meme coins can go to zero. Not financial advice.",
  ].join("\n");
}

function readOn(focus: CoinSnap): string {
  const scan = localScan(focus);
  return [
    `${focus.symbol} — ${scan.verdict}`,
    scan.tape,
    scan.flags.length ? `Flags: ${scan.flags.join("; ")}.` : null,
    scan.watch,
    "Not financial advice. Meme coins can go to zero.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function localChat(
  user: string,
  snapshot: CoinSnap[],
  focus: CoinSnap | null,
): string {
  const q = user.toLowerCase();

  if (/\b(rug|honeypot|scam|drain)\b/.test(q)) {
    return [
      "A rug is usually visible in the book, not in the meme.",
      "— Newborn pair and a tiny book is the default crime scene.",
      "— Sell-heavy tape while the chart still “looks green” is distribution.",
      "— No site, no pool depth, paid boosts only: you are looking at a billboard.",
      "— Renounced or not, if you cannot exit size, you do not have a market.",
      "None of that is a buy or a pass. It is how you read a crime novel. Meme coins can go to zero. Not financial advice.",
    ].join("\n");
  }

  if (/\b(volume|vol)\b/.test(q) && /\b(mcap|market cap|liquidity|book|liq)\b/.test(q)) {
    const pinned = focus
      ? ` On ${focus.symbol}: vol ${formatUsd(focus.volume24h)} vs mcap ${formatUsd(focus.marketCap)}${focus.liquidityUsd != null ? ` vs book ${formatUsd(focus.liquidityUsd)}` : ""}.`
      : "";
    return [
      "Volume is how much changed hands. Market cap is price times supply — a headline, not cash.",
      "Liquidity is whether you can actually exit. A $20m “mcap” on a $4k book is a screenshot, not a market.",
      `High vol / thin book is a slot machine.${pinned}`,
      "Not financial advice.",
    ].join("\n\n");
  }

  if (/\b(rule|how do you|desk rules|how (should|do) i read)\b/.test(q)) {
    return [
      "Desk rules, short:",
      "— Boosts are ads. Ignore the golden ticker.",
      "— Age and liquidity first. Narrative last.",
      "— One-sided tape is a fact. “Community” is a press release.",
      "— If you cannot name the exit, you do not have a trade. I still will not tell you to take one.",
      "Meme coins can go to zero. Not financial advice.",
    ].join("\n");
  }

  if (/\b(moving|pump|hot|what's on the tape|whats on the tape|radar)\b/.test(q)) {
    return movers(snapshot);
  }

  if (focus) return readOn(focus);

  if (snapshot.length) return movers(snapshot);

  return "Pin a coin on the tape or search a ticker and I will read the numbers. I do not pick winners. Not financial advice.";
}
