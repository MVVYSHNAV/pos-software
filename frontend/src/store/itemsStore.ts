import { create } from "zustand"
import type { Item } from "@/types/item"
import { getItems, getItemGroups } from "@/api/items"

interface ItemsState {
    items: Item[]
    categories: string[]
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
    setCategory: (category: string) => void
    setSearchTerm: (term: string) => void
    getFilteredItems: () => Item[]
}

export const useItemsStore = create<ItemsState>((set, get) => ({
    items: [],
    categories: [],
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
            const result = await getItems(priceList, 0, 50)
            set({
                items: result.items,
                loading: false,
                offset: result.items.length,
                hasMore: result.hasMore,
                totalItems: result.total
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
            const result = await getItems(priceList, offset, 50)
            set({
                items: [...items, ...result.items],
                loadingMore: false,
                offset: offset + result.items.length,
                hasMore: result.hasMore,
                totalItems: result.total
            })
        } catch (e: any) {
            set({ error: e.message, loadingMore: false })
        }
    },

    resetItems: () => {
        set({ items: [], offset: 0, hasMore: true, totalItems: 0 })
    },

    fetchCategories: async () => {
        try {
            const groups = await getItemGroups()
            const categoryNames = groups.map((g: any) => g.name)
            set({ categories: categoryNames })
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
        const { items, selectedCategory, searchTerm } = get()

        let filtered = items

        // Filter by category
        if (selectedCategory !== "All Items") {
            filtered = filtered.filter(item => item.item_group === selectedCategory)
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
