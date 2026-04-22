import { create } from "zustand";
import type { RankedCandidate } from "@/lib/types";

export type RankRow = RankedCandidate & { locked?: boolean };

type State = {
  items: RankRow[];
  setItems: (items: RankRow[]) => void;
  reorder: (oldIndex: number, newIndex: number) => void;
  removeAt: (index: number) => void;
  reset: () => void;
};

function withLockedDefaults(list: RankRow[]): RankRow[] {
  return list.map((a) => ({ ...a, locked: a.locked ?? false }));
}

function reorderArray<T>(list: T[], from: number, to: number) {
  const next = list.slice();
  const [m] = next.splice(from, 1);
  next.splice(to, 0, m);
  return next;
}

export const useRankingStore = create<State>((set, get) => ({
  items: [],
  setItems: (items) => set({ items: items.map((a) => ({ ...a, locked: a.locked ?? false })) }),
  reorder: (oldIndex, newIndex) => {
    const { items } = get();
    if (oldIndex < 0 || newIndex < 0) return;
    if (oldIndex === newIndex) return;
    if (items[oldIndex]?.locked) return;
    if (items[newIndex]?.locked) return;
    set({ items: withLockedDefaults(reorderArray(items, oldIndex, newIndex)) });
  },
  removeAt: (index) => {
    const { items } = get();
    if (items[index]?.locked) return;
    set({ items: withLockedDefaults(items.filter((_, i) => i !== index)) });
  },
  reset: () => set({ items: [] }),
}));

export { withLockedDefaults as assignRanks };
