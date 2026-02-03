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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-4 md:gap-6 p-4 md:p-10">
      {items.map((item) => (
        <ItemCard key={item.item_code} item={item} />
      ))}
    </div>
  )
}
