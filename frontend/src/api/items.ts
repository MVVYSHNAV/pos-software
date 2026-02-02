import { db } from "./frappe"
import type { Item } from "@/types/item"

export async function getItems(priceList: string) {
  const [items, prices, bins] = await Promise.all([
    db.getDocList<Item>("Item", {
      fields: [
        "name",
        "item_code",
        "item_name",
        "item_group",
        "stock_uom",
        "image",
        "description"
      ],
      filters: [
        ["disabled", "=", 0],
        ["is_sales_item", "=", 1],
      ],
      limit: 500,
    }),
    db.getDocList("Item Price", {
      fields: ["item_code", "price_list_rate"],
      filters: [
        ["price_list", "=", priceList],
      ],
      limit: 1000,
    }),
    db.getDocList("Bin", {
      fields: ["item_code", "actual_qty"],
      limit: 1000,
    })
  ])

  const priceMap = new Map(prices.map((p: any) => [p.item_code, p.price_list_rate]))

  const stockMap = new Map()
  bins.forEach((b: any) => {
    const current = stockMap.get(b.item_code) || 0
    stockMap.set(b.item_code, current + b.actual_qty)
  })

  return items.map(item => ({
    ...item,
    standard_rate: priceMap.get(item.item_code) || 0,
    actual_qty: stockMap.get(item.item_code) || 0
  }))
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
