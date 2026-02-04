import { db } from "./frappe"
import type { Item } from "@/types/item"
import { DOCTYPES } from "@/constants/doctypes"

export async function getItems(priceList: string, offset: number = 0, limit: number = 50) {
  const [items, prices, bins, totalCountResult] = await Promise.all([
    db.getDocList<Item>(DOCTYPES.ITEM, {
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
      limit,
      limit_start: offset,
    }),
    db.getDocList(DOCTYPES.ITEM_PRICE, {
      fields: ["item_code", "price_list_rate"],
      filters: [
        ["price_list", "=", priceList],
      ],
      limit: 10000,
    }),
    db.getDocList(DOCTYPES.BIN, {
      fields: ["item_code", "actual_qty"],
      limit: 10000,
    }),
    // Get total count of items
    db.getDocList<Item>(DOCTYPES.ITEM, {
      fields: ["name"],
      filters: [
        ["disabled", "=", 0],
        ["is_sales_item", "=", 1],
      ],
      limit: 0, // Get count only
    })
  ])

  const priceMap = new Map(prices.map((p: any) => [p.item_code, p.price_list_rate]))

  const stockMap = new Map()
  bins.forEach((b: any) => {
    const current = stockMap.get(b.item_code) || 0
    stockMap.set(b.item_code, current + b.actual_qty)
  })

  const itemsWithPrices = items.map(item => ({
    ...item,
    standard_rate: priceMap.get(item.item_code) || 0,
    actual_qty: stockMap.get(item.item_code) || 0
  }))

  return {
    items: itemsWithPrices,
    total: totalCountResult.length || 0,
    hasMore: offset + items.length < (totalCountResult.length || 0)
  }
}

export async function getItemGroups() {
  return await db.getDocList(DOCTYPES.ITEM_GROUP, {
    fields: ["name", "parent_item_group"],
    filters: [
      ["is_group", "=", 0],
    ],
    limit: 100,
  })
}

export async function getItemPrice(itemCode: string, priceList: string) {
  const prices = await db.getDocList(DOCTYPES.ITEM_PRICE, {
    fields: ["price_list_rate"],
    filters: [
      ["item_code", "=", itemCode],
      ["price_list", "=", priceList],
    ],
    limit: 1,
  })

  return prices.length ? prices[0].price_list_rate : 0
}
