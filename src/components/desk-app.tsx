import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Activity, Coins, MessageSquare, Search, X } from "lucide-react";
import { getRadar, hydrateCoin, searchMarket } from "@/lib/market";
import { chatDesk, scanDesk } from "@/lib/ai";
import type { ChatMessage, Coin } from "@/lib/types";
import { formatUsd, toSnap } from "@/lib/format";
import { useDeskStore, type MobileTab } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { TokenMark, Delta } from "@/components/marks";
import { TickerTape } from "@/components/ticker-tape";
import { RadarPanel } from "@/components/radar-panel";
import { ChatPanel } from "@/components/chat-panel";
import { CoinPanel } from "@/components/coin-panel";

const CHAT_KEY = "fren-chat-v1";

function loadChat(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed.slice(-40) : [];
  } catch {
    return [];
  }
}

function uid() {
  return crypto.randomUUID();
}

export function DeskApp() {
  const selectedId = useDeskStore((s) => s.selectedId);
  const select = useDeskStore((s) => s.select);
  const mobileTab = useDeskStore((s) => s.mobileTab);
  const setTab = useDeskStore((s) => s.setTab);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Coin[]>([]);
  const [extra, setExtra] = useState<Coin[]>([]);
  const hydrated = useRef(new Set<string>());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMessages(loadChat());
  }, []);

  useEffect(() => {
    if (messages.length) localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-40)));
  }, [messages]);

  const radar = useQuery({
    queryKey: ["radar"],
    queryFn: () => getRadar(),
    refetchInterval: 45_000,
    enabled: mounted,
  });

  const listed = radar.data?.coins ?? [];
  const coins = useMemo(() => {
    const map = new Map<string, Coin>();
    for (const c of listed) map.set(c.id, c);
    for (const c of extra) map.set(c.id, c);
    return [...map.values()];
  }, [listed, extra]);

  const selected = coins.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId) return;
    const coin = coins.find((c) => c.id === selectedId);
    if (!coin || hydrated.current.has(selectedId)) return;
    hydrated.current.add(selectedId);
    void hydrateCoin({
      data: {
        id: coin.id,
        chainId: coin.chainId,
        tokenAddress: coin.tokenAddress ?? undefined,
      },
    })
      .then((res) => {
        if (!res.coin) return;
        setExtra((prev) => {
          const rest = prev.filter((c) => c.id !== res.coin!.id);
          return [...rest, { ...coin, ...res.coin }];
        });
      })
      .catch(() => {
        hydrated.current.delete(selectedId);
      });
  }, [selectedId, coins]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    const t = window.setTimeout(() => {
      searchMarket({ data: { q } })
        .then((res) => {
          setHits(res.coins);
          if (res.coins.length) {
            setExtra((prev) => {
              const map = new Map(prev.map((c) => [c.id, c]));
              for (const c of res.coins) map.set(c.id, c);
              return [...map.values()];
            });
          }
        })
        .catch(() => setHits([]));
    }, 350);
    return () => window.clearTimeout(t);
  }, [query]);

  const snapshot = useMemo(() => coins.slice(0, 8).map(toSnap), [coins]);

  const chatMut = useMutation({
    mutationFn: async (text: string) => {
      const history = [...messages, { id: uid(), role: "user" as const, content: text }];
      const payload = history.slice(-8).map((m) => ({ role: m.role, content: m.content }));
      return chatDesk({
        data: {
          messages: payload,
          snapshot,
          focus: selected ? toSnap(selected) : null,
        },
      });
    },
  });

  const scanMut = useMutation({
    mutationFn: async (coin: Coin) => {
      const note = [
        coin.description ? `Description: ${coin.description.slice(0, 400)}` : "",
        coin.tokenAddress ? `CA: ${coin.tokenAddress}` : "",
        coin.liquidityUsd != null ? `Liquidity USD: ${coin.liquidityUsd}` : "",
        coin.pairCreatedAt ? `Pair created: ${new Date(coin.pairCreatedAt).toISOString()}` : "",
        coin.websites.length ? `Sites: ${coin.websites.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      return scanDesk({ data: { focus: toSnap(coin), extra: note || null } });
    },
  });

  const pending = chatMut.isPending || scanMut.isPending;

  function pick(id: string) {
    select(id);
    setQuery("");
    setHits([]);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      setTab("coin");
    }
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    const userMsg: ChatMessage = { id: uid(), role: "user", content: trimmed };
    setMessages((m) => [...m, userMsg]);
    setTab("desk");
    try {
      const res = await chatMut.mutateAsync(trimmed);
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "assistant",
          content: res.ok ? res.text : res.error,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "assistant",
          content: "The desk line dropped. Try again.",
        },
      ]);
    }
  }

  async function scan() {
    if (!selected || pending) return;
    const coin = selected;
    setMessages((m) => [
      ...m,
      { id: uid(), role: "user", content: `Scan ${coin.symbol}` },
    ]);
    setTab("desk");
    try {
      const res = await scanMut.mutateAsync(coin);
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "assistant",
          content: res.ok ? res.text : res.error,
          scan: res.ok ? (res.scan ?? null) : null,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: uid(), role: "assistant", content: "Scan failed. Try again." },
      ]);
    }
  }

  const tabs: { id: MobileTab; label: string; icon: typeof Activity }[] = [
    { id: "radar", label: "Tape", icon: Activity },
    { id: "desk", label: "Desk", icon: MessageSquare },
    { id: "coin", label: "Coin", icon: Coins },
  ];

  return (
    <div className="desk-shell flex h-dvh min-h-0 flex-col overflow-hidden">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-3 py-2.5 sm:px-5">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="font-display text-2xl italic leading-none sm:text-3xl">FREN</span>
          <span className="hidden text-xs tracking-[0.18em] text-muted-foreground sm:inline">
            DESK
          </span>
        </div>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ticker or contract"
            className="pl-10 pr-10"
            aria-label="Search meme coins"
          />
          {query ? (
            <button
              type="button"
              className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
              onClick={() => {
                setQuery("");
                setHits([]);
              }}
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          ) : null}
          {hits.length > 0 ? (
            <ul className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-xl bg-popover p-1 shadow-[var(--shadow-border)]">
              {hits.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => pick(c.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-accent"
                  >
                    <TokenMark symbol={c.symbol} imageUrl={c.imageUrl} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{c.symbol}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {c.name} · {c.chainLabel}
                      </span>
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {formatUsd(c.priceUsd)}
                    </span>
                    <Delta value={c.changeH24} className="text-xs" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="size-1.5 rounded-full bg-up" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </header>

      <TickerTape coins={coins.slice(0, 16)} onPick={pick} />

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px] xl:grid-cols-[300px_minmax(0,1fr)_340px]">
        <div
          className={cn(
            "min-h-0 border-border lg:block lg:border-r",
            mobileTab === "radar" ? "block" : "hidden",
          )}
        >
          <RadarPanel
            coins={coins}
            loading={!mounted || radar.isLoading}
            error={radar.isError}
            onRetry={() => radar.refetch()}
            onPick={pick}
          />
        </div>
        <div
          className={cn(
            "min-h-0 lg:block lg:border-r lg:border-border",
            mobileTab === "desk" ? "block" : "hidden",
          )}
        >
          <ChatPanel
            messages={messages}
            pending={pending}
            focus={selected}
            onSend={send}
            onScan={scan}
            draft={draft}
            setDraft={setDraft}
          />
        </div>
        <div className={cn("min-h-0 lg:block", mobileTab === "coin" ? "block" : "hidden")}>
          <CoinPanel coin={selected} scanning={scanMut.isPending} onScan={scan} onAsk={send} />
        </div>
      </div>

      <nav className="grid shrink-0 grid-cols-3 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] lg:hidden">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = mobileTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1 text-xs",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
