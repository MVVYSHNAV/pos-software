import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Customer } from "@/types/customer"

interface CartItem {
  item_code: string
  item_name: string
  qty: number
  rate: number
}

interface Order {
  id: number
  items: CartItem[]
  customer?: Customer
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
  loadOrder: (items: CartItem[], customer?: Customer) => void
  setCustomer: (customer: Customer | undefined) => void

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
            if (state.orders.length === 1) {
              return {
                orders: [{ ...state.orders[0], items: [], customer: undefined }]
              }
            }
          }

          const newOrders = state.orders.filter(o => o.id !== orderId)
          let newActiveId = state.activeOrderId

          if (state.activeOrderId === orderId) {
            const closedIndex = state.orders.findIndex(o => o.id === orderId)
            if (newOrders.length > 0) {
              const nextOrder = newOrders[Math.min(closedIndex, newOrders.length - 1)]
              newActiveId = nextOrder.id
            }
          }

          return {
            orders: newOrders,
            activeOrderId: newActiveId
          }
        }),

      selectOrder: (orderId) => set({ activeOrderId: orderId }),

      loadOrder: (items, customer) =>
        set(state => {
          const newOrders = state.orders.map(order => {
            if (order.id !== state.activeOrderId) return order
            return { ...order, items, customer }
          })
          return { orders: newOrders }
        }),

      setCustomer: (customer) =>
        set(state => {
          const newOrders = state.orders.map(order => {
            if (order.id !== state.activeOrderId) return order
            return { ...order, customer }
          })
          return { orders: newOrders }
        }),
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
