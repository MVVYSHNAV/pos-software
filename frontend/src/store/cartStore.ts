import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface CartItem {
  item_code: string
  item_name: string
  qty: number
  rate: number
}

interface CartState {
  orderNumber: number
  items: CartItem[]

  addItem: (item: Omit<CartItem, "qty">) => void
  reduceItem: (itemCode: string) => void
  removeItem: (itemCode: string) => void
  clearCart: () => void
  newOrder: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      orderNumber: 1,
      items: [],

      addItem: (item) =>
        set(state => {
          const items = [...state.items]
          const idx = items.findIndex(
            i => i.item_code === item.item_code
          )

          if (idx > -1) {
            items[idx] = {
              ...items[idx],
              qty: items[idx].qty + 1,
            }
          } else {
            items.push({ ...item, qty: 1 })
          }

          return { items }
        }),

      reduceItem: (itemCode) =>
        set(state => {
          const items = [...state.items]
          const idx = items.findIndex(
            i => i.item_code === itemCode
          )

          if (idx > -1) {
            if (items[idx].qty > 1) {
              items[idx] = {
                ...items[idx],
                qty: items[idx].qty - 1,
              }
            } else {
              items.splice(idx, 1)
            }
          }

          return { items }
        }),

      removeItem: (itemCode) =>
        set(state => ({
          items: state.items.filter(
            i => i.item_code !== itemCode
          ),
        })),

      clearCart: () =>
        set({
          items: [],
        }),

      newOrder: () =>
        set(state => ({
          orderNumber: state.orderNumber + 1,
          items: [],
        })),
    }),
    {
      name: "tridz-pos-cart",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

export const selectSubtotal = (state: CartState) =>
  state.items.reduce((sum, item) => sum + (item.qty * item.rate), 0)
