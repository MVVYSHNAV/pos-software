export interface POSProfile {
  name: string
  company: string
  currency: string
  selling_price_list: string
  warehouse: string
  payments: {
    mode_of_payment: string
    default: number
  }[]
}
