import { Button } from "@/components/ui/button"
import { useItemsStore } from "@/store/itemsStore"

export function CategoryBar() {
  const { categories, selectedCategory, setCategory } = useItemsStore()

  return (
    <div className="flex gap-2 px-6 py-3 border-b overflow-x-auto">
      {categories.map(cat => (
        <Button
          key={cat}
          variant={cat === selectedCategory ? "default" : "outline"}
          className="whitespace-nowrap"
          onClick={() => setCategory(cat)}
        >
          {cat}
        </Button>
      ))}
    </div>
  )
}
