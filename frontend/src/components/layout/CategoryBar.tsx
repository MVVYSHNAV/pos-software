import { Button } from "@/components/ui/button"
import { useItemsStore } from "@/store/itemsStore"
import { cn } from "@/lib/utils"

export function CategoryBar() {
  const { categories, selectedCategory, setCategory } = useItemsStore()

  return (
    <div className="flex gap-2 px-4 py-3 bg-background overflow-x-auto border-b border-border hide-scrollbar">
      <Button
        key="all"
        variant="ghost"
        className={cn(
          "rounded-lg px-4 py-1.5 md:px-4 md:py-1.5 h-auto text-sm md:text-sm font-semibold transition-all whitespace-nowrap",
          selectedCategory === "All Items"
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-muted/50 text-muted-foreground hover:bg-muted text-foreground"
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
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted/50 text-muted-foreground hover:bg-muted text-foreground"
          )}
          onClick={() => setCategory(cat)}
        >
          {cat}
        </Button>
      ))}
    </div>
  )
}
