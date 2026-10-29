import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getShopForItem } from '@/mocks/shops';

const computeStats = (rawItems = []) => {
  const safeItems = (Array.isArray(rawItems) ? rawItems : []).map((ci) => ({
    ...ci,
    quantity: Math.max(1, Number(ci.quantity) || 1),
    price: Number(ci.price) || 0,
  }));
  const cartCount = safeItems.reduce((sum, ci) => sum + ci.quantity, 0);
  const cartTotal = safeItems.reduce((sum, ci) => sum + ci.price * ci.quantity, 0);
  return { cartCount, cartTotal, safeItems };
};

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      cartCount: 0,
      cartTotal: 0,
      cartShopId: null,
      cartShopName: null,
      cartCounterLocation: null,

      setCartShop: (shopId, shopName, counterLocation) => {
        const cleanLocation = counterLocation ? counterLocation.replace(/Counter\s*#?\d*/gi, 'Store').trim() : 'Main Store';
        set((s) => ({
          cartShopId: shopId,
          cartShopName: shopName,
          cartCounterLocation: cleanLocation,
          cartItems: (s.cartItems || []).map((ci) => ({
            ...ci,
            shopId: shopId || ci.shopId,
            shopName: shopName || ci.shopName,
            counterLocation: cleanLocation || ci.counterLocation,
          })),
        }));
      },

      addItem: (item, quantity = 1, shopOverride = null) => {
        if (!item) return;
        const safeQty = Math.max(1, Number(quantity) || 1);
        const currentShopId = get().cartShopId;
        const activeShopId =
          (shopOverride && typeof shopOverride === 'object')
            ? shopOverride.id
            : (shopOverride || currentShopId);

        const assignedShop =
          (shopOverride && typeof shopOverride === 'object' && shopOverride.id)
            ? shopOverride
            : getShopForItem(item, activeShopId);

        const targetShopId =
          (shopOverride && typeof shopOverride === 'object' ? shopOverride.id : null) ||
          (shopOverride && typeof shopOverride === 'string' ? shopOverride : null) ||
          currentShopId ||
          item.shopId ||
          assignedShop?.id ||
          'main-store';

        const targetShopName =
          (shopOverride && typeof shopOverride === 'object' ? shopOverride.name : null) ||
          get().cartShopName ||
          assignedShop?.name ||
          item.shopName ||
          'BIT Central Stationery Store';

        let targetCounterLocation =
          (shopOverride && typeof shopOverride === 'object' ? (shopOverride.counter || shopOverride.tagline) : null) ||
          get().cartCounterLocation ||
          assignedShop?.counter ||
          item.counterLocation ||
          'Main Store';
        if (targetCounterLocation && typeof targetCounterLocation === 'string') {
          targetCounterLocation = targetCounterLocation.replace(/Counter\s*#?\d*/gi, 'Store').trim();
        }

        const enrichedItem = {
          ...item,
          price: Number(item.price) || 0,
          shopId: targetShopId,
          shopName: targetShopName,
          counterLocation: targetCounterLocation,
        };

        const currentItems = Array.isArray(get().cartItems) ? get().cartItems : [];
        const existingIndex = currentItems.findIndex((ci) => ci.id === item.id);
        let nextItems;

        if (existingIndex >= 0) {
          const existing = currentItems[existingIndex];
          const maxStock = typeof item.stock === 'number' && item.stock > 0 ? item.stock : 999;
          const nextQty = Math.min((Number(existing.quantity) || 1) + safeQty, maxStock);
          nextItems = currentItems.map((ci, idx) =>
            idx === existingIndex
              ? {
                  ...ci,
                  ...enrichedItem,
                  quantity: Math.max(1, nextQty),
                }
              : ci
          );
        } else {
          nextItems = [...currentItems, { ...enrichedItem, quantity: safeQty }];
        }

        const { cartCount, cartTotal, safeItems } = computeStats(nextItems);

        set((s) => ({
          cartItems: safeItems,
          cartCount,
          cartTotal,
          cartShopId: targetShopId || s.cartShopId,
          cartShopName: targetShopName || s.cartShopName,
          cartCounterLocation: targetCounterLocation || s.cartCounterLocation,
        }));
      },

      removeItem: (id) => {
        const currentItems = Array.isArray(get().cartItems) ? get().cartItems : [];
        const nextItems = currentItems.filter((ci) => ci.id !== id);
        const { cartCount, cartTotal, safeItems } = computeStats(nextItems);
        set((s) => ({
          cartItems: safeItems,
          cartCount,
          cartTotal,
          cartShopId: safeItems.length === 0 ? null : s.cartShopId,
          cartShopName: safeItems.length === 0 ? null : s.cartShopName,
          cartCounterLocation: safeItems.length === 0 ? null : s.cartCounterLocation,
        }));
      },

      updateQty: (id, quantity) => {
        const safeQty = Math.max(1, Number(quantity) || 1);
        const currentItems = Array.isArray(get().cartItems) ? get().cartItems : [];
        const nextItems = currentItems.map((ci) =>
          ci.id === id ? { ...ci, quantity: safeQty } : ci
        );
        const { cartCount, cartTotal, safeItems } = computeStats(nextItems);
        set({
          cartItems: safeItems,
          cartCount,
          cartTotal,
        });
      },

      clearCart: () =>
        set({
          cartItems: [],
          cartCount: 0,
          cartTotal: 0,
          cartShopId: null,
          cartShopName: null,
          cartCounterLocation: null,
        }),
    }),
    {
      name: 'bsp-cart-storage',
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.cartItems)) {
          const { cartCount, cartTotal, safeItems } = computeStats(state.cartItems);
          state.cartItems = safeItems;
          state.cartCount = cartCount;
          state.cartTotal = cartTotal;
        }
      },
    }
  )
);

export default useCartStore;
