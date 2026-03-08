import { create } from 'zustand';

export interface AIStackItem {
  productId: string;
  variantId: string;
  name: string;
  price: string;
  quantity: number;
  imageUrl?: string;
}

interface AIStackStore {
  items: AIStackItem[];
  isOpen: boolean;
  addItem: (item: Omit<AIStackItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearStack: () => void;
  setOpen: (open: boolean) => void;
}

export const useAIStackStore = create<AIStackStore>((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (item) => {
    const { items } = get();
    const existing = items.find(i => i.productId === item.productId);
    if (existing) {
      set({
        items: items.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        ),
        isOpen: true,
      });
    } else {
      set({
        items: [...items, { ...item, quantity: item.quantity || 1 }],
        isOpen: true,
      });
    }
  },

  removeItem: (productId) => {
    const newItems = get().items.filter(i => i.productId !== productId);
    set({ items: newItems, isOpen: newItems.length > 0 });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map(i =>
        i.productId === productId ? { ...i, quantity } : i
      ),
    });
  },

  clearStack: () => set({ items: [], isOpen: false }),
  setOpen: (open) => set({ isOpen: open }),
}));
