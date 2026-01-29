import { db } from "./frappe"
import type { Item } from "@/types/item"

export async function getItems(_priceList: string) {
  return await db.getDocList<Item>("Item", {
    fields: ["name", "item_name", "stock_uom"],
    filters: [
      ["disabled", "=", 0],
      ["is_sales_item", "=", 1],
    ],
    limit: 100,
  })
}

export async function getItemPrice(itemCode: string, priceList: string) {
  const prices = await db.getDocList("Item Price", {
    fields: ["price_list_rate"],
    filters: [
      ["item_code", "=", itemCode],
      ["price_list", "=", priceList],
    ],
    limit: 1,
  })

  return prices.length ? prices[0].price_list_rate : 0
}
