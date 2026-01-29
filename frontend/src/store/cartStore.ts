import { create } from "zustand"

interface CartItem {
  item_code: string
  item_name: string
  qty: number
  rate: number
}

interface CartState {
  items: CartItem[]
  subtotal: number

  addItem: (item: Omit<CartItem, "qty">) => void
  removeItem: (itemCode: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  subtotal: 0,

  addItem: (item) => {
    const items = [...get().items]
    const existing = items.find(i => i.item_code === item.item_code)

    if (existing) {
      existing.qty += 1
    } else {
      items.push({ ...item, qty: 1 })
    }

    const subtotal = items.reduce(
      (sum, i) => sum + i.qty * i.rate,
      0
    )

    set({ items, subtotal })
  },

  removeItem: (itemCode) => {
    const items = get().items.filter(i => i.item_code !== itemCode)
    const subtotal = items.reduce(
      (sum, i) => sum + i.qty * i.rate,
      0
    )

    set({ items, subtotal })
  },

  clear: () => set({ items: [], subtotal: 0 }),
}))
