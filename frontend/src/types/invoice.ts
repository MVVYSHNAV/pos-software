export interface SalesInvoiceItem {
  item_code: string
  qty: number
  rate: number
}

export interface Payment {
  mode_of_payment: string
  amount: number
}
