import { db } from "./frappe"
import type { SalesInvoiceItem, Payment } from "@/types/invoice"

export async function createInvoice(data: {
  customer: string
  pos_profile: string
  company: string
  items: SalesInvoiceItem[]
  payments: Payment[]
}) {
  const invoice = await db.createDoc("POS Invoice", {
    is_pos: 1,
    customer: data.customer,
    company: data.company,
    pos_profile: data.pos_profile,
    items: data.items,
    payments: data.payments,
    update_stock: 1,
  })

  return invoice
}

export async function submitInvoice(invoice: any) {
  return await db.submit(invoice)
}

export async function updateInvoice(name: string, data: any) {
  return await db.updateDoc("POS Invoice", name, data)
}
