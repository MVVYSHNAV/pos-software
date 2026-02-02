import { db } from "@/api/frappe"
import type { SalesInvoiceItem, Payment } from "@/types/invoice"

export async function createDraftPOSInvoice(data: {
    customer: string
    company: string
    pos_profile: string
    pos_opening_entry: string
    currency: string
    warehouse: string
    items: SalesInvoiceItem[]
    payments: Payment[]
}) {
    return await db.createDoc("Sales Invoice", {
        doctype: "Sales Invoice",
        is_pos: 1,
        customer: data.customer,
        company: data.company,
        pos_profile: data.pos_profile,
        pos_opening_entry: data.pos_opening_entry,
        currency: data.currency,
        update_stock: 1,
        warehouse: data.warehouse,

        items: data.items.map(i => ({
            item_code: i.item_code,
            qty: i.qty,
            rate: i.rate,
            warehouse: data.warehouse,
        })),

        // mandatory even for draft
        payments: data.payments.length
            ? data.payments
            : [{ mode_of_payment: "Cash", amount: 0 }],
    })
}
