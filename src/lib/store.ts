import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WatchItem = {
  id: string;
  symbol: string;
  name: string;
  imageUrl: string | null;
};

export type MobileTab = "radar" | "desk" | "coin";

type DeskState = {
  selectedId: string | null;
  mobileTab: MobileTab;
  watchlist: WatchItem[];
  select: (id: string | null) => void;
  setTab: (tab: MobileTab) => void;
  toggleWatch: (item: WatchItem) => void;
};

export const useDeskStore = create<DeskState>()(
  persist(
    (set, get) => ({
      selectedId: null,
      mobileTab: "desk",
      watchlist: [],
      select: (id) => set({ selectedId: id }),
      setTab: (mobileTab) => set({ mobileTab }),
      toggleWatch: (item) => {
        const exists = get().watchlist.some((w) => w.id === item.id);
        set({
          watchlist: exists
            ? get().watchlist.filter((w) => w.id !== item.id)
            : [item, ...get().watchlist].slice(0, 24),
        });
      },
    }),
    {
      name: "fren-desk",
      partialize: (s) => ({ watchlist: s.watchlist }),
    },
  ),
);
