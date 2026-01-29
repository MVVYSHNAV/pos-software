import { db } from "./frappe"
import type { Item } from "@/types/item"

export async function getItems(_priceList: string) {
  return await db.getDocList<Item>("Item", {
    fields: [
      "name",
      "item_code",
      "item_name",
      "item_group",
      "stock_uom",
      "image",
      "standard_rate",
      "description"
    ],
    filters: [
      ["disabled", "=", 0],
      ["is_sales_item", "=", 1],
    ],
    limit: 500,
  })
}

export async function getItemGroups() {
  return await db.getDocList("Item Group", {
    fields: ["name", "parent_item_group"],
    filters: [
      ["is_group", "=", 0],
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
