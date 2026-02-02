import { create } from "zustand"

import { useCartStore } from "./cartStore"


export const useInvoiceStore = create(() => ({
  submit: async () => {
    // Invoice creation removed per user request
    const cart = useCartStore.getState()
    cart.newOrder()
  },
}))
