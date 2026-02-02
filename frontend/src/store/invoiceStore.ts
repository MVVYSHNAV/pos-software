import { create } from "zustand"

import { useCartStore } from "./cartStore"

interface InvoiceState {
  draftInvoice: string | null
  setDraftInvoice: (name: string) => void
  clearInvoice: () => void
}


export const useInvoiceStore = create<InvoiceState>((set) => ({

  draftInvoice: null,
  setDraftInvoice: name => set({ draftInvoice: name }),
  clearInvoice: () => set({ draftInvoice: null }),
  submit: async () => {
    // Invoice creation removed per user request
    const cart = useCartStore.getState()
    cart.newOrder()
  },
}))
