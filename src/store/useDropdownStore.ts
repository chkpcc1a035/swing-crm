import { create } from "zustand";

interface DropdownState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggle: () => void;
}

export const useDropdownStore = create<DropdownState>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
  toggle: () => set((state: DropdownState) => ({ isOpen: !state.isOpen })),
}));
