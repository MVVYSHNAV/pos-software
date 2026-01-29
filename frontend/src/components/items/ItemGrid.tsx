import { ItemCard } from "./ItemCard"

export function ItemGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
      {[...Array(12)].map((_, i) => (
        <ItemCard key={i} />
      ))}
    </div>
  )
}
