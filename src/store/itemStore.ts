// Store for managing item-related state and operations
import { create } from "zustand";
import { Item, CsvError } from "@/types";

type ItemStore = {
  items: Item[];
  selectedItem: Item | null;
  pendingItems: Item[];
  csvErrors: CsvError[];
  setItems: (items: Item[]) => void;
  setPendingItems: (items: Item[]) => void;
  setSelectedItem: (item: Item | null) => void;
  setCsvErrors: (errors: CsvError[]) => void;
  clearPendingItems: () => void;
  clearCsvErrors: () => void;
};

export const useItemStore = create<ItemStore>((set) => ({
  items: [],
  selectedItem: null,
  pendingItems: [],
  csvErrors: [],
  setItems: (items) => set({ items }),
  setPendingItems: (items) => set({ pendingItems: items }),
  setSelectedItem: (item) => set({ selectedItem: item }),
  setCsvErrors: (errors) => set({ csvErrors: errors }),
  clearPendingItems: () => set({ pendingItems: [] }),
  clearCsvErrors: () => set({ csvErrors: [] }),
}));
