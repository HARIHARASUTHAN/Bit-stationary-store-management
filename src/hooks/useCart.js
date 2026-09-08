import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],

      addItem: (item, quantity = 1) => {
        const existing = get().cartItems.find((ci) => ci.id === item.id);
        if (existing) {
          set((s) => ({
            cartItems: s.cartItems.map((ci) =>
              ci.id === item.id
                ? { ...ci, quantity: Math.min(ci.quantity + quantity, item.stock) }
                : ci
            ),
          }));
        } else {
          set((s) => ({ cartItems: [...s.cartItems, { ...item, quantity }] }));
        }
      },

      removeItem: (id) =>
        set((s) => ({ cartItems: s.cartItems.filter((ci) => ci.id !== id) })),

      updateQty: (id, quantity) =>
        set((s) => ({
          cartItems: s.cartItems.map((ci) =>
            ci.id === id ? { ...ci, quantity: Math.max(1, quantity) } : ci
          ),
        })),

      clearCart: () => set({ cartItems: [] }),

      get cartTotal() {
        return get().cartItems.reduce((sum, ci) => sum + ci.price * ci.quantity, 0);
      },

      get cartCount() {
        return get().cartItems.reduce((sum, ci) => sum + ci.quantity, 0);
      },
    }),
    { name: 'bsp-cart-storage' }
  )
);

export default useCartStore;
