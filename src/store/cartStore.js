import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useCartStore = create(
	persist(
		(set, get) => ({

			items: [],

			addMovie: (movieItem) => {
				const items = get().items;

				if (!movieItem.id) {
					movieItem.id = `movie-${movieItem.movieId || Date.now()}-${movieItem.showtimeId || Date.now()}`;
				}

				const existingIndex = items.findIndex(
					item => item.type === 'movie' && item.id === movieItem.id
				);
				
				if (existingIndex >= 0) {

					const updated = [...items];
					updated[existingIndex] = { ...movieItem, type: 'movie' };
					set({ items: updated });
				} else {

					set({ items: [...items, { ...movieItem, type: 'movie' }] });
				}

				if (typeof window !== 'undefined') {
					const event = new CustomEvent('cartItemAdded', { 
						detail: { 
							item: movieItem.movieTitle || "Film",
							price: movieItem.price || 0 
						} 
					});
					window.dispatchEvent(event);
				}
			},

			addSnack: (snackItem) => {
				const items = get().items;

				if (!snackItem.id) {
					snackItem.id = `snack-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
				}

				const existingIndex = items.findIndex(
					item => item.type === 'snack' && item.id === snackItem.id
				);
				
				if (existingIndex >= 0) {
					const updated = [...items];
					updated[existingIndex].quantity = (updated[existingIndex].quantity || 1) + (snackItem.quantity || 1);
					set({ items: updated });
				} else {
					set({ items: [...items, { ...snackItem, type: 'snack', quantity: snackItem.quantity || 1 }] });
				}

				if (typeof window !== 'undefined') {
					const event = new CustomEvent('cartItemAdded', { 
						detail: { 
							item: snackItem.name || "Snack",
							price: (snackItem.price || 0) * (snackItem.quantity || 1)
						} 
					});
					window.dispatchEvent(event);
				}
			},

			removeItem: (itemId) => {
				set({ items: get().items.filter(item => item.id !== itemId) });
			},

			updateQuantity: (itemId, quantity) => {

				if (quantity < 1) {
					quantity = 1;
				}
				const items = get().items;
				const updated = items.map(item => 
					item.id === itemId ? { ...item, quantity } : item
				);
				set({ items: updated });
			},

			getTotalPrice: () => {
				return get().items.reduce((total, item) => {
					return total + (item.price || 0) * (item.quantity || 1);
				}, 0);
			},

			getTotalItems: () => {
				return get().items.reduce((total, item) => {
					return total + (item.quantity || 1);
				}, 0);
			},

			clearCart: () => {
				set({ items: [] });
			},
		}),
		{
			name: 'cinemor-cart',
			storage: createJSONStorage(() => localStorage),
		}
	)
);
