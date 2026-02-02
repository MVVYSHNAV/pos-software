export interface Item {
  name: string
  item_code: string
  item_name: string
  item_group: string
  stock_uom: string
  image?: string
  standard_rate: number
  actual_qty: number
  description?: string
}
