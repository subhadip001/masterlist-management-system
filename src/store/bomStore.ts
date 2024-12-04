// src/store/bomStore.ts
import { create } from "zustand";
import { BOM } from "@/types";

interface BomStore {
  pendingBoms: BOM[];
  csvErrors: any[];
  setPendingBoms: (items: BOM[]) => void;
  setCsvErrors: (errors: any[]) => void;
  clearPendingBoms: () => void;
  clearCsvErrors: () => void;
}

export const useBomStore = create<BomStore>((set) => ({
  pendingBoms: [],
  csvErrors: [],
  setPendingBoms: (boms) => set({ pendingBoms: boms }),
  setCsvErrors: (errors) => set({ csvErrors: errors }),
  clearPendingBoms: () => set({ pendingBoms: [] }),
  clearCsvErrors: () => set({ csvErrors: [] }),
}));
