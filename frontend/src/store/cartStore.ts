import { create } from "zustand"

interface CartItem {
  item_code: string
  item_name: string
  qty: number
  rate: number
}

interface CartState {
  orderNumber: number
  items: CartItem[]
  subtotal: number

  addItem: (item: Omit<CartItem, "qty">) => void
  removeItem: (itemCode: string) => void
  reduceItem: (itemCode: string) => void
  clearCart: () => void
  newOrder: () => void
}

export const useCartStore = create<CartState>((set) => ({
  orderNumber: 1,
  items: [],
  subtotal: 0,

  addItem: (item) => {
    console.log("Adding item to cart:", item)
    set((state) => {
      const items = [...state.items]
      const existingIndex = items.findIndex(i => i.item_code === item.item_code)

      if (existingIndex > -1) {
        items[existingIndex] = {
          ...items[existingIndex],
          qty: items[existingIndex].qty + 1
        }
      } else {
        items.push({ ...item, qty: 1 })
      }

      const subtotal = items.reduce(
        (sum, i) => sum + i.qty * i.rate,
        0
      )

      console.log("New cart state:", { items, subtotal })
      return { items, subtotal }
    })
  },

  removeItem: (itemCode) => {
    set((state) => {
      const items = state.items.filter(i => i.item_code !== itemCode)
      const subtotal = items.reduce(
        (sum, i) => sum + i.qty * i.rate,
        0
      )
      return { items, subtotal }
    })
  },

  reduceItem: (itemCode) => {
    set((state) => {
      const items = [...state.items]
      const existingIndex = items.findIndex(i => i.item_code === itemCode)

      if (existingIndex > -1) {
        if (items[existingIndex].qty > 1) {
          items[existingIndex] = {
            ...items[existingIndex],
            qty: items[existingIndex].qty - 1
          }
        } else {
          items.splice(existingIndex, 1)
        }
      }

      const subtotal = items.reduce(
        (sum, i) => sum + i.qty * i.rate,
        0
      )

      return { items, subtotal }
    })
  },

  clearCart: () => {
    set({
      items: [],
      subtotal: 0,
    })
  },

  newOrder: () =>
    set(state => ({
      orderNumber: state.orderNumber + 1,
      items: [],
      subtotal: 0,
    })),
}))
