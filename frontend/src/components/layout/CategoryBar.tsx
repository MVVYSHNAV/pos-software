import { Button } from "@/components/ui/button"
import { useItemsStore } from "@/store/itemsStore"
import { cn } from "@/lib/utils"

export function CategoryBar() {
  const { categories, selectedCategory, setCategory } = useItemsStore()

  return (
    <div className="flex gap-2 px-4 py-3 bg-gray-50/50 overflow-x-auto border-b">
      <Button
        key="all"
        variant="ghost"
        className={cn(
          "rounded-md px-4 py-1.5 h-auto text-sm font-medium transition-colors",
          selectedCategory === "All Items"
            ? "bg-[#52796F] text-white hover:bg-[#526471] hover:text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        )}
        onClick={() => setCategory("All Items")}
      >
        All Items
      </Button>
      {categories.map(cat => (
        <Button
          key={cat}
          variant="ghost"
          className={cn(
            "rounded-md px-4 py-1.5 h-auto text-sm font-medium transition-colors",
            cat === selectedCategory
              ? "bg-[#52796F] text-white hover:bg-[#43535e] hover:text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
          onClick={() => setCategory(cat)}
        >
          {cat}
        </Button>
      ))}
    </div>
  )
}
