import { Button } from "@/components/ui/button"
import { useItemsStore } from "@/store/itemsStore"
import { cn } from "@/lib/utils"

export function CategoryBar() {
  const { categories, selectedCategory, setCategory } = useItemsStore()

  return (
    <div className="flex gap-2 px-4 py-3 bg-gray-50/50 overflow-x-auto border-b hide-scrollbar">
      <Button
        key="all"
        variant="ghost"
        className={cn(
          "rounded-lg px-4 py-1.5 md:px-4 md:py-1.5 h-auto text-sm md:text-sm font-semibold transition-all whitespace-nowrap",
          selectedCategory === "All Items"
            ? "bg-[#52796F] text-white hover:bg-[#A8BCB7]"
            : "bg-gray-100/80 text-gray-600 hover:bg-[#A8BCB7]"
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
            "rounded-lg px-4 py-1.5 md:px-4 md:py-1.5 h-auto text-sm md:text-sm font-semibold transition-all whitespace-nowrap",
            cat === selectedCategory
              ? "bg-[#52796F] text-white hover:bg-[#A8BCB7]"
              : "bg-gray-100/80 text-gray-600 hover:bg-[#A8BCB7]"
          )}
          onClick={() => setCategory(cat)}
        >
          {cat}
        </Button>
      ))}
    </div>
  )
}
