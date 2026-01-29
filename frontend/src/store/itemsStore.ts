import { create } from "zustand"
import type { Item } from "@/types/item"
import { getItems, getItemGroups } from "@/api/items"

interface ItemsState {
    items: Item[]
    categories: string[]
    selectedCategory: string
    searchTerm: string
    loading: boolean
    error: string | null

    fetchItems: (priceList: string) => Promise<void>
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
    error: null,

    fetchItems: async (priceList: string) => {
        try {
            set({ loading: true, error: null })
            const items = await getItems(priceList)
            set({ items, loading: false })
        } catch (e: any) {
            set({ error: e.message, loading: false })
        }
    },

    fetchCategories: async () => {
        try {
            const groups = await getItemGroups()
            const categoryNames = groups.map((g: any) => g.name)
            set({ categories: ["All Items", ...categoryNames] })
        } catch (e: any) {
            console.error("Failed to fetch categories:", e)
            set({ categories: ["All Items"] })
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
