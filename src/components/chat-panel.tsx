import { useEffect, useMemo, useRef, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp, ScanLine, Trash2 } from "lucide-react";
import type { ChatMessage, Coin, ScanResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STARTERS = [
  "What's moving on the tape?",
  "How do I read volume versus market cap?",
  "What usually precedes a rug?",
  "Give me the desk rules for memes.",
];

function riskClass(risk: ScanResult["risk"]) {
  if (risk === "low") return "text-up";
  if (risk === "medium") return "text-warn";
  if (risk === "high" || risk === "extreme") return "text-down";
  return "text-muted-foreground";
}

function ScanCard({ scan }: { scan: ScanResult }) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground">SCAN</p>
        <span className={cn("text-xs font-medium uppercase tracking-wide", riskClass(scan.risk))}>
          {scan.risk} risk
        </span>
      </div>
      <p className="mt-2 text-sm font-medium leading-snug">{scan.verdict}</p>
      <p className="mt-2 text-sm leading-normal text-muted-foreground">{scan.narrative}</p>
      {scan.flags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {scan.flags.map((f) => (
            <Badge key={f}>{f}</Badge>
          ))}
        </div>
      ) : null}
      <dl className="mt-3 space-y-2 text-sm">
        <div>
          <dt className="text-xs tracking-wide text-muted-foreground">Tape</dt>
          <dd className="mt-0.5 leading-normal">{scan.tape}</dd>
        </div>
        <div>
          <dt className="text-xs tracking-wide text-muted-foreground">Watch</dt>
          <dd className="mt-0.5 leading-normal">{scan.watch}</dd>
        </div>
      </dl>
    </div>
  );
}

export function ChatPanel({
  messages,
  pending,
  focus,
  onSend,
  onScan,
  onClear,
  draft,
  setDraft,
}: {
  messages: ChatMessage[];
  pending: boolean;
  focus: Coin | null;
  onSend: (text: string) => void;
  onScan: () => void;
  onClear: () => void;
  draft: string;
  setDraft: (v: string) => void;
}) {
  const bottom = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  const empty = messages.length === 0 && !pending;

  const chips = useMemo(() => {
    if (!focus) return STARTERS;
    return [
      `What's the read on ${focus.symbol}?`,
      `Scan ${focus.symbol}`,
      ...STARTERS.slice(0, 2),
    ];
  }, [focus]);

  function submit(e?: FormEvent) {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || pending) return;
    onSend(text);
    setDraft("");
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex items-center justify-between gap-3 px-5 py-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground">DESK</p>
          <p className="truncate text-sm">
            {focus ? (
              <>
                Talking <span className="font-medium">{focus.symbol}</span>
              </>
            ) : (
              "Ask FREN about the tape"
            )}
          </p>
        </div>
        {messages.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={onClear} aria-label="Clear thread">
            <Trash2 />
            Clear
          </Button>
        ) : null}
      </header>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-6">
        {empty ? (
          <div className="flex min-h-full flex-col justify-end gap-6 py-6">
            <div className="enter-rise">
              <h2 className="font-display text-4xl italic leading-none sm:text-5xl">
                The desk is open.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-normal text-muted-foreground">
                FREN reads live meme-coin tape and talks like a skeptical wire desk — never a
                tipster. Pin a coin, type Scan DOGE, or just ask.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onSend(c)}
                  className="rounded-full px-3 py-2 text-left text-sm text-foreground shadow-[var(--shadow-border)] transition-[box-shadow,background-color] duration-150 hover:bg-accent hover:shadow-[var(--shadow-border-hover)]"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-4 py-4">
            {messages.map((m) => (
              <article
                key={m.id}
                className={cn(
                  "enter-rise max-w-[92%]",
                  m.role === "user" ? "ml-auto" : "mr-auto",
                )}
              >
                {m.role === "user" ? (
                  <div className="rounded-xl rounded-br-sm bg-secondary px-4 py-3 text-sm leading-normal">
                    {m.content}
                  </div>
                ) : m.error ? (
                  <p className="text-sm leading-normal text-down">{m.content}</p>
                ) : (
                  <div className="space-y-3">
                    {m.scan ? <ScanCard scan={m.scan} /> : null}
                    {m.scan ? (
                      m.content && m.content !== m.scan.verdict ? (
                        <p className="text-sm leading-normal text-muted-foreground">{m.content}</p>
                      ) : null
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-normal">{m.content}</p>
                    )}
                  </div>
                )}
              </article>
            ))}
            {pending ? (
              <p className="shimmer-text text-sm">FREN is reading the tape…</p>
            ) : null}
            <div ref={bottom} />
          </div>
        )}
      </div>

      <form
        onSubmit={submit}
        className="border-t border-border bg-background p-3 sm:p-4"
      >
        <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-xl bg-card p-2 shadow-[var(--shadow-border)]">
          <textarea
            ref={input}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            rows={1}
            placeholder={focus ? `Ask about ${focus.symbol}…` : "Ask the desk or Scan DOGE"}
            className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-normal text-foreground outline-none placeholder:text-muted-foreground"
          />
          {focus ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Scan pinned coin"
              onClick={onScan}
              disabled={pending}
            >
              <ScanLine />
            </Button>
          ) : null}
          <Button
            type="submit"
            size="icon"
            aria-label="Send"
            disabled={pending || !draft.trim()}
          >
            <ArrowUp />
          </Button>
        </div>
      </form>
    </section>
  );
}
