import { create } from "zustand"
import type { Item } from "@/types/item"
import { db } from "@/api/frappe"
import { DOCTYPES } from "@/constants/doctypes"
import { usePosStore } from "./posStore"

// Helper to get all descendant groups (including self)
const getDescendantGroups = (rootGroup: string, tree: any[]) => {
    const root = tree.find(g => g.name === rootGroup)
    if (!root) return [rootGroup]

    return tree
        .filter(g => g.lft >= root.lft && g.rgt <= root.rgt)
        .map(g => g.name)
}

interface ItemsState {
    items: Item[]
    categories: string[]
    itemGroupTree: any[]
    selectedCategory: string
    searchTerm: string
    loading: boolean
    loadingMore: boolean
    error: string | null
    offset: number
    hasMore: boolean
    totalItems: number

    fetchItems: (priceList: string) => Promise<void>
    loadMoreItems: (priceList: string) => Promise<void>
    resetItems: () => void
    fetchCategories: () => Promise<void>
    fetchItemGroupTree: () => Promise<void>
    setCategory: (category: string) => void
    setSearchTerm: (term: string) => void
    getFilteredItems: () => Item[]
}

export const useItemsStore = create<ItemsState>((set, get) => ({
    items: [],
    categories: [],
    itemGroupTree: [],
    selectedCategory: "All Items",
    searchTerm: "",
    loading: false,
    loadingMore: false,
    error: null,
    offset: 0,
    hasMore: true,
    totalItems: 0,

    fetchItems: async (priceList: string) => {
        try {
            set({ loading: true, error: null, offset: 0, items: [] })

            const limit = 50
            const offset = 0

            // Get allowed item groups from POS Profile
            const posProfile = usePosStore.getState().profile
            console.log("POS Profile in fetchItems:", posProfile)

            const allowedGroups = posProfile?.item_groups?.map(g => g.item_group) || []
            console.log("Allowed Groups:", allowedGroups)

            const itemFilters: any[] = [
                ["disabled", "=", 0],
                ["is_sales_item", "=", 1],
            ]

            if (allowedGroups.length > 0) {
                itemFilters.push(["item_group", "in", allowedGroups])
            }

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
                    filters: itemFilters,
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
                    filters: itemFilters,
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

            set({
                items: itemsWithPrices,
                loading: false,
                offset: itemsWithPrices.length,
                hasMore: offset + items.length < (totalCountResult.length || 0),
                totalItems: totalCountResult.length || 0
            })
        } catch (e: any) {
            set({ error: e.message, loading: false })
        }
    },

    loadMoreItems: async (priceList: string) => {
        const { loadingMore, hasMore, offset, items } = get()

        if (loadingMore || !hasMore) return

        try {
            set({ loadingMore: true, error: null })

            const limit = 50

            // Get allowed item groups from POS Profile
            const posProfile = usePosStore.getState().profile
            const profileGroups = posProfile?.item_groups?.map(g => g.item_group) || []

            // Re-use tree logic (it should be loaded by now or we use what we have)
            const { itemGroupTree } = get()
            let allowedGroups: string[] = []

            if (profileGroups.length > 0) {
                const expanded = new Set<string>()
                profileGroups.forEach(g => {
                    const descendants = getDescendantGroups(g, itemGroupTree)
                    descendants.forEach(d => expanded.add(d))
                })
                allowedGroups = Array.from(expanded)
            }

            const itemFilters: any[] = [
                ["disabled", "=", 0],
                ["is_sales_item", "=", 1],
            ]

            if (allowedGroups.length > 0) {
                itemFilters.push(["item_group", "in", allowedGroups])
            }

            const [newItems, prices, bins, totalCountResult] = await Promise.all([
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
                    filters: itemFilters,
                    limit,
                    limit_start: offset,
                }),
                db.getDocList(DOCTYPES.ITEM_PRICE, {
                    fields: ["item_code", "price_list_rate"],
                    filters: [
                        ["price_list", "=", priceList],
                    ],
                    limit: 50,
                }),
                db.getDocList(DOCTYPES.BIN, {
                    fields: ["item_code", "actual_qty"],
                    limit: 50,
                }),
                // Get total count of items (re-fetching to be safe, or could store it)
                db.getDocList<Item>(DOCTYPES.ITEM, {
                    fields: ["name"],
                    filters: itemFilters,
                    limit: 0, // Get count only
                })
            ])

            const priceMap = new Map(prices.map((p: any) => [p.item_code, p.price_list_rate]))

            const stockMap = new Map()
            bins.forEach((b: any) => {
                const current = stockMap.get(b.item_code) || 0
                stockMap.set(b.item_code, current + b.actual_qty)
            })

            const itemsWithPrices = newItems.map(item => ({
                ...item,
                standard_rate: priceMap.get(item.item_code) || 0,
                actual_qty: stockMap.get(item.item_code) || 0
            }))

            set({
                items: [...items, ...itemsWithPrices],
                loadingMore: false,
                offset: offset + itemsWithPrices.length,
                hasMore: offset + newItems.length < (totalCountResult.length || 0),
                totalItems: totalCountResult.length || 0
            })
        } catch (e: any) {
            set({ error: e.message, loadingMore: false })
        }
    },

    resetItems: () => {
        set({ items: [], offset: 0, hasMore: true, totalItems: 0 })
    },

    fetchItemGroupTree: async () => {
        try {
            const tree = await db.getDocList(DOCTYPES.ITEM_GROUP, {
                fields: ["name", "lft", "rgt", "is_group", "parent_item_group"],
                limit: 1000,
            })
            set({ itemGroupTree: tree })
        } catch (e) {
            console.error("Failed to fetch Item Group tree", e)
        }
    },

    fetchCategories: async () => {
        try {
            const posProfile = usePosStore.getState().profile
            // If POS Profile has item groups configured, use ONLY those
            if (posProfile?.item_groups && posProfile.item_groups.length > 0) {
                const categoryNames = posProfile.item_groups.map(g => g.item_group)
                set({ categories: categoryNames })
            } else {
                set({ categories: [] })
            }
        } catch (e: any) {
            console.error("Failed to fetch categories:", e)
            set({ categories: [] })
        }
    },

    setCategory: (category: string) => {
        set({ selectedCategory: category })
    },

    setSearchTerm: (term: string) => {
        set({ searchTerm: term })
    },

    getFilteredItems: () => {
        const { items, selectedCategory, searchTerm, itemGroupTree } = get()

        let filtered = items

        // Filter by category
        if (selectedCategory !== "All Items") {
            const descendants = getDescendantGroups(selectedCategory, itemGroupTree)
            filtered = filtered.filter(item => descendants.includes(item.item_group))
        }

        // Filter by search term
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(item =>
                item.item_name.toLowerCase().includes(term) ||
                item.item_code.toLowerCase().includes(term)
            )
        }

        return filtered
    },
}))
