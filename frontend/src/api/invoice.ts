import { db } from "@/api/frappe"
import type { SalesInvoiceItem, Payment } from "@/types/invoice"
import { DOCTYPES } from "@/constants/doctypes"

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
    return await db.createDoc(DOCTYPES.POS_INVOICE, {
        doctype: DOCTYPES.POS_INVOICE,
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

export async function getPaidInvoices() {
    return await db.getDocList(DOCTYPES.POS_INVOICE, {
        filters: [
            ["docstatus", "=", 1],
            ["status", "=", "Paid"]
        ],
        fields: ["name", "customer", "posting_date", "posting_time", "grand_total", "status", "currency"],
        orderBy: {
            field: "posting_date",
            order: "desc"
        }
    })
}
