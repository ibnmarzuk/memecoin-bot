import { i as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { c as toSnap, i as heatScore, n as formatPct, o as riskFromCoin, r as formatUsd, s as shortAddress, t as formatAge } from "./format-DuQl3DE9.mjs";
import { a as MessageSquare, c as Coins, d as Activity, i as ScanLine, l as Bookmark, o as ExternalLink, r as Search, s as Copy, t as X, u as ArrowUp } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Bm0zm6tp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getRadar = createServerFn({ method: "GET" }).handler(createSsrRpc("a529dd505c7d89ed0070e523e8993d8c31dbd33c0837e1ec0acef082b375f161"));
var searchMarket = createServerFn({ method: "POST" }).validator((input) => ({ q: String(input?.q ?? "").trim().slice(0, 80) })).handler(createSsrRpc("0a7cc0de19883550f6fa813f930a4faad3d92a5b281b7f88ec4cbf0dbcaa9af2"));
var hydrateCoin = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("3e4da6416916b692642028d6cb7bb1fa007a7dbcbeebc52f8232f4078a28e26f"));
var MAX_CONTENT = 4e3;
var chatDesk = createServerFn({ method: "POST" }).validator((input) => ({
	messages: (input.messages ?? []).slice(-8).map((m) => ({
		role: m.role === "assistant" ? "assistant" : "user",
		content: String(m.content ?? "").slice(0, MAX_CONTENT)
	})).filter((m) => m.content.trim()),
	snapshot: (input.snapshot ?? []).slice(0, 8),
	focus: input.focus ?? null
})).handler(createSsrRpc("75576047554d5634ba7813f52f579b4c6cb0db5e15fc648a3e1a673db09c3c13"));
var scanDesk = createServerFn({ method: "POST" }).validator((input) => ({
	focus: input.focus,
	extra: input.extra ? String(input.extra).slice(0, 1200) : null
})).handler(createSsrRpc("fa837041f2a2bbbd57e52a15440d58d3c6ef19be53614f8bdb1b39834c2a0e67"));
var useDeskStore = create()(persist((set, get) => ({
	selectedId: null,
	mobileTab: "desk",
	watchlist: [],
	select: (id) => set({ selectedId: id }),
	setTab: (mobileTab) => set({ mobileTab }),
	toggleWatch: (item) => {
		set({ watchlist: get().watchlist.some((w) => w.id === item.id) ? get().watchlist.filter((w) => w.id !== item.id) : [item, ...get().watchlist].slice(0, 24) });
	}
}), {
	name: "fren-desk",
	partialize: (s) => ({ watchlist: s.watchlist })
}));
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var Input = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	ref,
	className: cn("h-11 w-full rounded-md bg-secondary px-3.5 text-sm text-foreground placeholder:text-muted-foreground shadow-[var(--shadow-border)] outline-none transition-[box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-ring/70 disabled:opacity-50", className),
	...props
}));
Input.displayName = "Input";
function TokenMark({ symbol, imageUrl, size = "sm" }) {
	const [failed, setFailed] = (0, import_react.useState)(false);
	const dim = size === "lg" ? "size-12" : size === "md" ? "size-9" : "size-8";
	const letters = symbol.slice(0, 3);
	if (!imageUrl || failed) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(dim, "flex shrink-0 items-center justify-center rounded-sm bg-secondary text-xs font-medium text-muted-foreground"),
		"aria-hidden": true,
		children: letters
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: imageUrl,
		alt: "",
		className: cn(dim, "shrink-0 rounded-sm object-cover outline outline-1 -outline-offset-1 outline-foreground/10"),
		onError: () => setFailed(true)
	});
}
function Delta({ value, className }) {
	if (value == null || !Number.isFinite(value)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("tabular-nums text-muted-foreground", className),
		children: "—"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("tabular-nums", value > 0 ? "text-up" : value < 0 ? "text-down" : "text-muted-foreground", className),
		children: formatPct(value)
	});
}
function HeatBar({ value }) {
	const w = Math.max(4, Math.min(100, value));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-1 w-full overflow-hidden rounded-full bg-secondary",
		title: `Heat ${value}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full rounded-full bg-primary/80",
			style: { width: `${w}%` }
		})
	});
}
function TickerTape({ coins, onPick }) {
	if (coins.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-12 border-b border-border bg-background" });
	const loop = [...coins, ...coins];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative border-b border-border bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "tape-track flex w-max gap-1 py-2",
					children: loop.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onPick(c.id),
						className: "flex h-9 items-center gap-2 rounded-sm px-2.5 text-left hover:bg-accent",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenMark, {
								symbol: c.symbol,
								imageUrl: c.imageUrl,
								size: "sm"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-medium",
								children: c.symbol
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs tabular-nums text-muted-foreground",
								children: formatUsd(c.priceUsd)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
								value: c.changeH24,
								className: "text-xs"
							})
						]
					}, `${c.id}-${i}`))
				})
			})
		]
	});
}
function Skeleton({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-secondary", className),
		"aria-hidden": true
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
			ghost: "text-foreground hover:bg-accent",
			outline: "bg-transparent text-foreground shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
		},
		size: {
			default: "h-11 rounded-md px-4 text-sm",
			sm: "h-9 rounded-sm px-3 text-sm",
			lg: "h-12 rounded-md px-5 text-sm",
			icon: "size-11 rounded-md",
			"icon-sm": "size-9 rounded-sm"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, type = "button", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
	ref,
	type,
	className: cn(buttonVariants({
		variant,
		size
	}), className),
	...props
}));
Button.displayName = "Button";
function RadarPanel({ coins, loading, error, onRetry, onPick }) {
	const [filter, setFilter] = (0, import_react.useState)("all");
	const selectedId = useDeskStore((s) => s.selectedId);
	const watchlist = useDeskStore((s) => s.watchlist);
	const rows = (0, import_react.useMemo)(() => {
		const watched = new Set(watchlist.map((w) => w.id));
		let list = coins;
		if (filter === "watch") list = coins.filter((c) => watched.has(c.id));
		const scored = list.map((c) => ({
			coin: c,
			heat: heatScore(c)
		}));
		if (filter === "heat" || filter === "all") scored.sort((a, b) => filter === "heat" ? b.heat - a.heat : b.coin.volume24h - a.coin.volume24h);
		return scored;
	}, [
		coins,
		filter,
		watchlist
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex h-full min-h-0 flex-col bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center justify-between gap-2 px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.18em] text-muted-foreground",
				children: "TAPE"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-foreground",
				children: "Live meme radar"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex rounded-md bg-secondary p-1",
				children: [
					["all", "Vol"],
					["heat", "Heat"],
					["watch", "Desk"]
				].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setFilter(key),
					className: cn("h-8 rounded-sm px-2.5 text-xs font-medium transition-colors duration-150", filter === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"),
					children: label
				}, key))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "scrollbar-thin min-h-0 flex-1 overflow-y-auto px-2 pb-4",
			children: loading && coins.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2 px-2",
				children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 rounded-lg" }, i))
			}) : error && coins.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 py-10 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Tape is quiet."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					className: "mt-3",
					onClick: onRetry,
					children: "Retry"
				})]
			}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 py-10 text-center text-sm text-muted-foreground",
				children: filter === "watch" ? "Nothing pinned yet." : "No coins on the tape."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1",
				children: rows.map(({ coin, heat }, i) => {
					const active = coin.id === selectedId;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "enter-rise",
						style: { animationDelay: `${Math.min(i, 8) * 40}ms` },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onPick(coin.id),
							className: cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-[background-color,box-shadow] duration-150", active ? "bg-accent shadow-[var(--shadow-border-hover)]" : "hover:bg-accent/70"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenMark, {
								symbol: coin.symbol,
								imageUrl: coin.imageUrl,
								size: "md"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate text-sm font-medium",
											children: coin.symbol
										}),
										watchlist.some((w) => w.id === coin.id) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "size-3 fill-primary text-primary" }) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ml-auto text-sm tabular-nums",
											children: formatUsd(coin.priceUsd)
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate text-xs text-muted-foreground",
											children: coin.chainLabel
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "w-12",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeatBar, { value: heat })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
											value: coin.changeH24,
											className: "ml-auto text-xs"
										})
									]
								})]
							})]
						})
					}, coin.id);
				})
			})
		})]
	});
}
function Badge({ className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tracking-wide text-muted-foreground shadow-[var(--shadow-border)]", className),
		children
	});
}
var STARTERS = [
	"What's moving on the tape?",
	"How do I read volume versus market cap?",
	"What usually precedes a rug?",
	"Give me the desk rules for memes."
];
function riskClass(risk) {
	if (risk === "low") return "text-up";
	if (risk === "medium") return "text-warn";
	if (risk === "high" || risk === "extreme") return "text-down";
	return "text-muted-foreground";
}
function ScanCard({ scan }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-card p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.18em] text-muted-foreground",
					children: "SCAN"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("text-xs font-medium uppercase tracking-wide", riskClass(scan.risk)),
					children: [scan.risk, " risk"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm font-medium leading-snug",
				children: scan.verdict
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-normal text-muted-foreground",
				children: scan.narrative
			}),
			scan.flags.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-1.5",
				children: scan.flags.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: f }, f))
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-3 space-y-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "text-xs tracking-wide text-muted-foreground",
					children: "Tape"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "mt-0.5 leading-normal",
					children: scan.tape
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "text-xs tracking-wide text-muted-foreground",
					children: "Watch"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "mt-0.5 leading-normal",
					children: scan.watch
				})] })]
			})
		]
	});
}
function ChatPanel({ messages, pending, focus, onSend, onScan, draft, setDraft }) {
	const bottom = (0, import_react.useRef)(null);
	const input = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		bottom.current?.scrollIntoView({
			behavior: "smooth",
			block: "end"
		});
	}, [messages, pending]);
	const empty = messages.length === 0 && !pending;
	const chips = (0, import_react.useMemo)(() => {
		if (!focus) return STARTERS;
		return [
			`What's the read on ${focus.symbol}?`,
			`Is ${focus.symbol} a narrative trade or a ghost?`,
			...STARTERS.slice(0, 2)
		];
	}, [focus]);
	function submit(e) {
		e?.preventDefault();
		const text = draft.trim();
		if (!text || pending) return;
		onSend(text);
		setDraft("");
	}
	function onKey(e) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			submit();
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex h-full min-h-0 flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "flex items-center justify-between px-5 py-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.18em] text-muted-foreground",
					children: "DESK"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm",
					children: focus ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Talking ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: focus.symbol
					})] }) : "Ask FREN about the tape"
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-6",
				children: empty ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-h-full flex-col justify-end gap-6 py-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "enter-rise",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-4xl italic leading-none sm:text-5xl",
							children: "The desk is open."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 max-w-md text-sm leading-normal text-muted-foreground",
							children: "FREN reads live meme-coin tape and talks like a skeptical wire desk — never a tipster. Pin a coin, or just ask."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: chips.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onSend(c),
							className: "rounded-full px-3 py-2 text-left text-sm text-foreground shadow-[var(--shadow-border)] transition-[box-shadow,background-color] duration-150 hover:bg-accent hover:shadow-[var(--shadow-border-hover)]",
							children: c
						}, c))
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-2xl flex-col gap-4 py-4",
					children: [
						messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
							className: cn("enter-rise max-w-[92%]", m.role === "user" ? "ml-auto" : "mr-auto"),
							children: m.role === "user" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-xl rounded-br-sm bg-secondary px-4 py-3 text-sm leading-normal",
								children: m.content
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [m.scan ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanCard, { scan: m.scan }) : null, m.scan ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm leading-normal text-muted-foreground",
									children: m.content
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "whitespace-pre-wrap text-sm leading-normal",
									children: m.content
								})]
							})
						}, m.id)),
						pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "shimmer-text text-sm",
							children: "FREN is reading the tape…"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: bottom })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
				onSubmit: submit,
				className: "border-t border-border bg-background p-3 sm:p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-2xl items-end gap-2 rounded-xl bg-card p-2 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							ref: input,
							value: draft,
							onChange: (e) => setDraft(e.target.value),
							onKeyDown: onKey,
							rows: 1,
							placeholder: focus ? `Ask about ${focus.symbol}…` : "Ask the desk…",
							className: "max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-normal text-foreground outline-none placeholder:text-muted-foreground"
						}),
						focus ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon",
							"aria-label": "Scan pinned coin",
							onClick: onScan,
							disabled: pending,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, {})
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							size: "icon",
							"aria-label": "Send",
							disabled: pending || !draft.trim(),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, {})
						})
					]
				})
			})
		]
	});
}
function Stat({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md bg-secondary px-3 py-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs tracking-wide text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 text-sm font-medium tabular-nums",
			children
		})]
	});
}
function CoinPanel({ coin, scanning, onScan, onAsk }) {
	const toggleWatch = useDeskStore((s) => s.toggleWatch);
	const watchlist = useDeskStore((s) => s.watchlist);
	if (!coin) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex h-full flex-col items-center justify-center gap-2 px-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-3xl italic text-foreground",
			children: "Pick a coin"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "max-w-xs text-sm leading-normal text-muted-foreground",
			children: "Select something on the tape and FREN will keep it pinned while you talk."
		})]
	});
	const watching = watchlist.some((w) => w.id === coin.id);
	const heat = heatScore(coin);
	const flags = riskFromCoin(coin);
	const tape = [
		{
			label: "1h",
			value: coin.changeH1
		},
		{
			label: "6h",
			value: coin.changeH6
		},
		{
			label: "24h",
			value: coin.changeH24
		},
		{
			label: "7d",
			value: coin.changeD7
		}
	];
	async function copyAddress() {
		if (!coin?.tokenAddress) return;
		try {
			await navigator.clipboard.writeText(coin.tokenAddress);
			toast("Address copied");
		} catch {
			toast("Could not copy");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "scrollbar-thin flex h-full min-h-0 flex-col overflow-y-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "px-5 pt-5 pb-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenMark, {
								symbol: coin.symbol,
								imageUrl: coin.imageUrl,
								size: "lg"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-3xl italic leading-tight",
										children: coin.symbol
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: coin.chainLabel })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm text-muted-foreground",
									children: coin.name
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon-sm",
								"aria-label": watching ? "Unpin from desk" : "Pin to desk",
								onClick: () => toggleWatch({
									id: coin.id,
									symbol: coin.symbol,
									name: coin.name,
									imageUrl: coin.imageUrl
								}),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: cn("size-4", watching && "fill-primary text-primary") })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-end justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-medium tabular-nums tracking-tight",
							children: formatUsd(coin.priceUsd)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
							value: coin.changeH24,
							className: "text-base"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1 flex items-center justify-between text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Heat" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums",
								children: heat
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeatBar, { value: heat })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-4 gap-1 px-5",
				children: tape.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md bg-secondary px-2 py-2 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: t.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
						value: t.value,
						className: "text-xs"
					})]
				}, t.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-2 px-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Market cap",
						children: formatUsd(coin.marketCap)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Volume 24h",
						children: formatUsd(coin.volume24h)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Liquidity",
						children: formatUsd(coin.liquidityUsd)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Age",
						children: formatAge(coin.pairCreatedAt ?? coin.listedAt)
					})
				]
			}),
			coin.buys24h != null && coin.sells24h != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 px-5 text-xs text-muted-foreground",
				children: [
					"Tape",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "tabular-nums text-foreground",
						children: [
							coin.buys24h,
							" buys / ",
							coin.sells24h,
							" sells"
						]
					}),
					" ",
					"in 24h",
					coin.boosted ? ` · ${coin.boosted} paid boosts` : ""
				]
			}) : coin.rank ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 px-5 text-xs text-muted-foreground",
				children: [
					"Rank ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "tabular-nums text-foreground",
						children: ["#", coin.rank]
					}),
					coin.source === "listed" ? " · aggregated listing, not a pool" : ""
				]
			}) : null,
			flags.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-1.5 px-5",
				children: flags.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					className: "text-warn",
					children: f
				}, f))
			}) : null,
			coin.tokenAddress ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center gap-2 px-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "min-w-0 truncate text-xs text-muted-foreground",
						children: shortAddress(coin.tokenAddress)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						"aria-label": "Copy address",
						onClick: copyAddress,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" })
					}),
					coin.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: coin.url,
						target: "_blank",
						rel: "noreferrer",
						className: "inline-flex size-9 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground",
						"aria-label": "Open market page",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" })
					}) : null
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-auto flex flex-col gap-2 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: onScan,
						disabled: scanning,
						className: "h-12 rounded-lg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, {}), scanning ? "Reading tape…" : "Scan with FREN"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						className: "h-11 rounded-lg",
						onClick: () => onAsk(`What's the read on ${coin.symbol}?`),
						children: ["Ask about ", coin.symbol]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-xs leading-normal text-muted-foreground",
						children: "Not financial advice. Meme coins can go to zero."
					})
				]
			})
		]
	});
}
var CHAT_KEY = "fren-chat-v1";
function loadChat() {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(CHAT_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.slice(-40) : [];
	} catch {
		return [];
	}
}
function uid() {
	return crypto.randomUUID();
}
function DeskApp() {
	const selectedId = useDeskStore((s) => s.selectedId);
	const select = useDeskStore((s) => s.select);
	const mobileTab = useDeskStore((s) => s.mobileTab);
	const setTab = useDeskStore((s) => s.setTab);
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [query, setQuery] = (0, import_react.useState)("");
	const [hits, setHits] = (0, import_react.useState)([]);
	const [extra, setExtra] = (0, import_react.useState)([]);
	const hydrated = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setMounted(true);
		setMessages(loadChat());
	}, []);
	(0, import_react.useEffect)(() => {
		if (messages.length) localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-40)));
	}, [messages]);
	const radar = useQuery({
		queryKey: ["radar"],
		queryFn: () => getRadar(),
		refetchInterval: 45e3,
		enabled: mounted
	});
	const listed = radar.data?.coins ?? [];
	const coins = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const c of listed) map.set(c.id, c);
		for (const c of extra) map.set(c.id, c);
		return [...map.values()];
	}, [listed, extra]);
	const selected = coins.find((c) => c.id === selectedId) ?? null;
	(0, import_react.useEffect)(() => {
		if (!selectedId) return;
		const coin = coins.find((c) => c.id === selectedId);
		if (!coin || hydrated.current.has(selectedId)) return;
		hydrated.current.add(selectedId);
		hydrateCoin({ data: {
			id: coin.id,
			chainId: coin.chainId,
			tokenAddress: coin.tokenAddress ?? void 0
		} }).then((res) => {
			if (!res.coin) return;
			setExtra((prev) => {
				return [...prev.filter((c) => c.id !== res.coin.id), {
					...coin,
					...res.coin
				}];
			});
		}).catch(() => {
			hydrated.current.delete(selectedId);
		});
	}, [selectedId, coins]);
	(0, import_react.useEffect)(() => {
		const q = query.trim();
		if (q.length < 2) {
			setHits([]);
			return;
		}
		const t = window.setTimeout(() => {
			searchMarket({ data: { q } }).then((res) => {
				setHits(res.coins);
				if (res.coins.length) setExtra((prev) => {
					const map = new Map(prev.map((c) => [c.id, c]));
					for (const c of res.coins) map.set(c.id, c);
					return [...map.values()];
				});
			}).catch(() => setHits([]));
		}, 350);
		return () => window.clearTimeout(t);
	}, [query]);
	const snapshot = (0, import_react.useMemo)(() => coins.slice(0, 8).map(toSnap), [coins]);
	const chatMut = useMutation({ mutationFn: async (text) => {
		return chatDesk({ data: {
			messages: [...messages, {
				id: uid(),
				role: "user",
				content: text
			}].slice(-8).map((m) => ({
				role: m.role,
				content: m.content
			})),
			snapshot,
			focus: selected ? toSnap(selected) : null
		} });
	} });
	const scanMut = useMutation({ mutationFn: async (coin) => {
		const note = [
			coin.description ? `Description: ${coin.description.slice(0, 400)}` : "",
			coin.tokenAddress ? `CA: ${coin.tokenAddress}` : "",
			coin.liquidityUsd != null ? `Liquidity USD: ${coin.liquidityUsd}` : "",
			coin.pairCreatedAt ? `Pair created: ${new Date(coin.pairCreatedAt).toISOString()}` : "",
			coin.websites.length ? `Sites: ${coin.websites.join(", ")}` : ""
		].filter(Boolean).join("\n");
		return scanDesk({ data: {
			focus: toSnap(coin),
			extra: note || null
		} });
	} });
	const pending = chatMut.isPending || scanMut.isPending;
	function pick(id) {
		select(id);
		setQuery("");
		setHits([]);
		if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) setTab("coin");
	}
	async function send(text) {
		const trimmed = text.trim();
		if (!trimmed || pending) return;
		const userMsg = {
			id: uid(),
			role: "user",
			content: trimmed
		};
		setMessages((m) => [...m, userMsg]);
		setTab("desk");
		try {
			const res = await chatMut.mutateAsync(trimmed);
			setMessages((m) => [...m, {
				id: uid(),
				role: "assistant",
				content: res.ok ? res.text : res.error
			}]);
		} catch {
			setMessages((m) => [...m, {
				id: uid(),
				role: "assistant",
				content: "The desk line dropped. Try again."
			}]);
		}
	}
	async function scan() {
		if (!selected || pending) return;
		const coin = selected;
		setMessages((m) => [...m, {
			id: uid(),
			role: "user",
			content: `Scan ${coin.symbol}`
		}]);
		setTab("desk");
		try {
			const res = await scanMut.mutateAsync(coin);
			setMessages((m) => [...m, {
				id: uid(),
				role: "assistant",
				content: res.ok ? res.text : res.error,
				scan: res.ok ? res.scan ?? null : null
			}]);
		} catch {
			setMessages((m) => [...m, {
				id: uid(),
				role: "assistant",
				content: "Scan failed. Try again."
			}]);
		}
	}
	const tabs = [
		{
			id: "radar",
			label: "Tape",
			icon: Activity
		},
		{
			id: "desk",
			label: "Desk",
			icon: MessageSquare
		},
		{
			id: "coin",
			label: "Coin",
			icon: Coins
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "desk-shell flex h-dvh min-h-0 flex-col overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex shrink-0 items-center gap-3 border-b border-border px-3 py-2.5 sm:px-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-baseline gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-2xl italic leading-none sm:text-3xl",
							children: "FREN"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden text-xs tracking-[0.18em] text-muted-foreground sm:inline",
							children: "DESK"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: query,
								onChange: (e) => setQuery(e.target.value),
								placeholder: "Ticker or contract",
								className: "pl-10 pr-10",
								"aria-label": "Search meme coins"
							}),
							query ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground",
								onClick: () => {
									setQuery("");
									setHits([]);
								},
								"aria-label": "Clear search",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
							}) : null,
							hits.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-xl bg-popover p-1 shadow-[var(--shadow-border)]",
								children: hits.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => pick(c.id),
									className: "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-accent",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenMark, {
											symbol: c.symbol,
											imageUrl: c.imageUrl,
											size: "sm"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block truncate text-sm font-medium",
												children: c.symbol
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "block truncate text-xs text-muted-foreground",
												children: [
													c.name,
													" · ",
													c.chainLabel
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs tabular-nums text-muted-foreground",
											children: formatUsd(c.priceUsd)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
											value: c.changeH24,
											className: "text-xs"
										})
									]
								}) }, c.id))
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden items-center gap-2 sm:flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-up" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: "Live"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TickerTape, {
				coins: coins.slice(0, 16),
				onPick: pick
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px] xl:grid-cols-[300px_minmax(0,1fr)_340px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("min-h-0 border-border lg:block lg:border-r", mobileTab === "radar" ? "block" : "hidden"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadarPanel, {
							coins,
							loading: !mounted || radar.isLoading,
							error: radar.isError,
							onRetry: () => radar.refetch(),
							onPick: pick
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("min-h-0 lg:block lg:border-r lg:border-border", mobileTab === "desk" ? "block" : "hidden"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatPanel, {
							messages,
							pending,
							focus: selected,
							onSend: send,
							onScan: scan,
							draft,
							setDraft
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("min-h-0 lg:block", mobileTab === "coin" ? "block" : "hidden"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinPanel, {
							coin: selected,
							scanning: scanMut.isPending,
							onScan: scan,
							onAsk: send
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "grid shrink-0 grid-cols-3 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] lg:hidden",
				children: tabs.map((t) => {
					const Icon = t.icon;
					const active = mobileTab === t.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setTab(t.id),
						className: cn("flex h-14 flex-col items-center justify-center gap-1 text-xs", active ? "text-foreground" : "text-muted-foreground"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), t.label]
					}, t.id);
				})
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskApp, {});
}
//#endregion
export { Home as component };
