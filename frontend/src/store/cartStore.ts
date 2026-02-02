import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface CartItem {
  item_code: string
  item_name: string
  qty: number
  rate: number
}

interface Order {
  id: number
  items: CartItem[]
}

interface CartState {
  orderCounter: number // Keeps track of the total orders created to generate unique IDs
  orders: Order[]
  activeOrderId: number

  // Actions
  addItem: (item: Omit<CartItem, "qty">) => void
  reduceItem: (itemCode: string) => void
  removeItem: (itemCode: string) => void
  clearCart: () => void
  newOrder: () => void
  closeOrder: (orderId: number) => void
  selectOrder: (orderId: number) => void

  // Selectors (helper accessors, though typically used in component selectors)
  getActiveOrder: () => Order | undefined
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      orderCounter: 1,
      orders: [{ id: 1, items: [] }],
      activeOrderId: 1,

      getActiveOrder: () => {
        const { orders, activeOrderId } = get()
        return orders.find(o => o.id === activeOrderId)
      },

      addItem: (item) =>
        set(state => {
          const newOrders = state.orders.map(order => {
            if (order.id !== state.activeOrderId) return order

            const items = [...order.items]
            const idx = items.findIndex(i => i.item_code === item.item_code)

            if (idx > -1) {
              items[idx] = { ...items[idx], qty: items[idx].qty + 1 }
            } else {
              items.push({ ...item, qty: 1 })
            }
            return { ...order, items }
          })
          return { orders: newOrders }
        }),

      reduceItem: (itemCode) =>
        set(state => {
          const newOrders = state.orders.map(order => {
            if (order.id !== state.activeOrderId) return order

            const items = [...order.items]
            const idx = items.findIndex(i => i.item_code === itemCode)

            if (idx > -1) {
              if (items[idx].qty > 1) {
                items[idx] = { ...items[idx], qty: items[idx].qty - 1 }
              } else {
                items.splice(idx, 1)
              }
            }
            return { ...order, items }
          })
          return { orders: newOrders }
        }),

      removeItem: (itemCode) =>
        set(state => {
          const newOrders = state.orders.map(order => {
            if (order.id !== state.activeOrderId) return order
            return {
              ...order,
              items: order.items.filter(i => i.item_code !== itemCode)
            }
          })
          return { orders: newOrders }
        }),

      clearCart: () =>
        set(state => {
          const newOrders = state.orders.map(order => {
            if (order.id !== state.activeOrderId) return order
            return { ...order, items: [] }
          })
          return { orders: newOrders }
        }),

      newOrder: () =>
        set(state => {
          const newId = state.orderCounter + 1
          return {
            orderCounter: newId,
            orders: [...state.orders, { id: newId, items: [] }],
            activeOrderId: newId
          }
        }),

      closeOrder: (orderId) =>
        set(state => {
          if (state.orders.length <= 1) {
            // Should not close the last order, maybe just clear it or do nothing?? 
            // Usually we want at least one order. If closing the last one, maybe reset it?
            // Let's implement: if 1 order left, clear it, don't remove it.
            if (state.orders.length === 1) {
              return {
                orders: [{ ...state.orders[0], items: [] }]
              }
            }
          }

          const newOrders = state.orders.filter(o => o.id !== orderId)
          let newActiveId = state.activeOrderId

          if (state.activeOrderId === orderId) {
            // We closed the active order, need to switch to another
            // Try previous, or next.
            // Simplest: take the last one in the new list, or index 0?
            // If we close order index 2, we can go to index 1.
            // If we close index 0, go to index 0 (which was 1).
            const closedIndex = state.orders.findIndex(o => o.id === orderId)
            // newOrders has the item removed.
            // If closedIndex was 0, new active is 0 (which was next).
            // If closedIndex was last, new active is last-1.
            if (newOrders.length > 0) {
              // Try to keep relative position or go to last
              const nextOrder = newOrders[Math.min(closedIndex, newOrders.length - 1)]
              newActiveId = nextOrder.id
            }
          }

          return {
            orders: newOrders,
            activeOrderId: newActiveId
          }
        }),

      selectOrder: (orderId) => set({ activeOrderId: orderId })
    }),
    {
      name: "tridz-pos-cart",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

export const selectSubtotal = (state: CartState) => {
  const activeOrder = state.orders.find(o => o.id === state.activeOrderId)
  if (!activeOrder) return 0
  return activeOrder.items.reduce((sum, item) => sum + (item.qty * item.rate), 0)
}

// Helper selector for components to get items easily
export const selectActiveItems = (state: CartState) => {
  return state.orders.find(o => o.id === state.activeOrderId)?.items || []
}
