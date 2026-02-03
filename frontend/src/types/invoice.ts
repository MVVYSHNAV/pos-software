// Types for Invoice
export interface SalesInvoiceItem {
  item_code: string
  qty: number
  rate: number
  item_name?: string
  description?: string
  warehouse?: string
  uom?: string
  conversion_factor?: number
  pos_invoice_item?: string // For return invoices - links to original invoice item row
}

export interface Payment {
  mode_of_payment: string
  amount: number
}
