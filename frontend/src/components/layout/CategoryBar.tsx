import { Button } from "@/components/ui/button"

const categories = [
  "All Items",
  "Beverages",
  "Snacks",
  "Groceries",
  "Personal Care",
  "Stationery",
  "Electronics",
  "Household",
]

export function CategoryBar() {
  return (
    <div className="flex gap-2 px-6 py-3 border-b overflow-x-auto">
      {categories.map(cat => (
        <Button
          key={cat}
          variant={cat === "All Items" ? "default" : "outline"}
          className="whitespace-nowrap"
        >
          {cat}
        </Button>
      ))}
    </div>
  )
}
