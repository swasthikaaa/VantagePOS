import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
    items: [],
    customer: { name: 'Walk-in Customer', contact: '' },

    addItem: (product, variation = null) => {
        const items = get().items;
        const existingIndex = items.findIndex(
            (item) => item.productId === product._id && item.variationId === (variation?._id || null)
        );

        if (existingIndex > -1) {
            const newItems = [...items];
            newItems[existingIndex].quantity += 1;
            set({ items: newItems });
        } else {
            set({
                items: [
                    ...items,
                    {
                        productId: product._id,
                        name: product.name,
                        variationId: variation?._id || null,
                        variationName: variation?.name || '',
                        variationValue: variation?.value || '',
                        unitPrice: variation?.price || product.basePrice,
                        quantity: 1,
                        discount: 0,
                        tax: (variation?.price || product.basePrice) * (product.taxRate / 100),
                    },
                ],
            });
        }
    },

    removeItem: (productId, variationId = null) => {
        set({
            items: get().items.filter(
                (item) => !(item.productId === productId && item.variationId === variationId)
            ),
        });
    },

    updateQuantity: (productId, variationId, quantity) => {
        const newItems = get().items.map((item) => {
            if (item.productId === productId && item.variationId === variationId) {
                return { ...item, quantity: Math.max(1, quantity) };
            }
            return item;
        });
        set({ items: newItems });
    },

    clearCart: () => set({ items: [], customer: { name: 'Walk-in Customer', contact: '' } }),

    getTotal: () => {
        return get().items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
    },
}));
