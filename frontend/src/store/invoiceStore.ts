import { create } from "zustand"
import { createInvoice, submitInvoice } from "@/api/invoice"
import { useCartStore } from "./cartStore"
import { usePosStore } from "./posStore"

interface InvoiceState {
  submit: () => Promise<void>
}

export const useInvoiceStore = create<InvoiceState>(() => ({
  submit: async () => {
    const cart = useCartStore.getState()
    const pos = usePosStore.getState()

    if (!pos.profile) return

    const invoice = await createInvoice({
      customer: "Walk In Customer",
      company: pos.profile.company,
      pos_profile: pos.profile.name,
      items: cart.items.map(i => ({
        item_code: i.item_code,
        qty: i.qty,
        rate: i.rate,
      })),
      payments: [
        {
          mode_of_payment: pos.profile.payments[0].mode_of_payment,
          amount: cart.subtotal,
        },
      ],
    })

    await submitInvoice(invoice.name)
    cart.clear()
  },
}))
