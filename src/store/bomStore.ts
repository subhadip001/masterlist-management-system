// Store for managing bom-related state and operations
import { create } from "zustand";
import { BOM, CsvError, Item } from "@/types";

interface BomStore {
  pendingBoms: BOM[];
  pendingSellItems: Item[];
  csvErrors: CsvError[];
  setPendingBoms: (boms: BOM[]) => void;
  setPendingSellItems: (items: Item[]) => void;
  setCsvErrors: (errors: CsvError[]) => void;
  clearPendingBoms: () => void;
  clearPendingSellItems: () => void;
  clearCsvErrors: () => void;
}

export const useBomStore = create<BomStore>((set) => ({
  pendingBoms: [],
  pendingSellItems: [],
  csvErrors: [],
  setPendingBoms: (boms) => set({ pendingBoms: boms }),
  setPendingSellItems: (items) => set({ pendingSellItems: items }),
  setCsvErrors: (errors) => set({ csvErrors: errors }),
  clearPendingBoms: () => set({ pendingBoms: [] }),
  clearPendingSellItems: () => set({ pendingSellItems: [] }),
  clearCsvErrors: () => set({ csvErrors: [] }),
}));
