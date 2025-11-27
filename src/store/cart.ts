import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  slug: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

interface CartActions {
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (slug: string) => void
  updateQuantity: (slug: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
}

type CartStore = CartState & CartActions

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) => {
        const items = get().items
        const existingItem = items.find((i) => i.slug === item.slug)

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.slug === item.slug
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          })
        } else {
          set({
            items: [...items, { ...item, quantity }],
          })
        }

        // Open cart when adding item
        set({ isOpen: true })
      },

      removeItem: (slug) => {
        set({
          items: get().items.filter((i) => i.slug !== slug),
        })
      },

      updateQuantity: (slug, quantity) => {
        if (quantity <= 0) {
          get().removeItem(slug)
          return
        }

        set({
          items: get().items.map((i) =>
            i.slug === slug ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen })
      },

      openCart: () => {
        set({ isOpen: true })
      },

      closeCart: () => {
        set({ isOpen: false })
      },
    }),
    {
      name: "starterspark-cart",
      // Only persist items, not the open/closed state
      partialize: (state) => ({ items: state.items }),
    }
  )
)

// Selectors
export const selectCartTotal = (state: CartStore) =>
  state.items.reduce((total, item) => total + item.price * item.quantity, 0)

export const selectCartCount = (state: CartStore) =>
  state.items.reduce((count, item) => count + item.quantity, 0)
