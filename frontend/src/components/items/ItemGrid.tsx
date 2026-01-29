import { ItemCard } from "./ItemCard"
import { useItemsStore } from "@/store/itemsStore"

export function ItemGrid() {
  const { getFilteredItems, loading } = useItemsStore()
  const items = getFilteredItems()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading items...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No items found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 p-4 sm:p-6">
      {items.map((item) => (
        <ItemCard key={item.item_code} item={item} />
      ))}
    </div>
  )
}
