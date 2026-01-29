import { Button } from "@/components/ui/button"
import type { Item } from "@/types/item"
import { useCartStore } from "@/store/cartStore"

interface ItemCardProps {
  item: Item
}

export function ItemCard({ item }: ItemCardProps) {
  const addItem = useCartStore(state => state.addItem)

  const handleAddToCart = () => {
    addItem({
      item_code: item.item_code,
      item_name: item.item_name,
      rate: item.standard_rate ?? 0,
    })
  }

  const stockQty = item.actual_qty ?? 0
  const stockColor = stockQty > 50 ? "text-green-600" : stockQty > 10 ? "text-orange-600" : "text-red-600"

  return (
    <div className="border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow">
      {item.image ? (
        <img
          src={item.image}
          alt={item.item_name}
          className="h-32 sm:h-40 w-full object-cover bg-muted"
        />
      ) : (
        <div className="h-32 sm:h-40 bg-muted flex items-center justify-center text-muted-foreground">
          No Image
        </div>
      )}

      <div className="p-3 sm:p-4 space-y-2">
        <div className="font-semibold text-sm sm:text-base line-clamp-2">
          {item.item_name}
        </div>

        <div className="text-xs text-muted-foreground">
          {item.item_code}
        </div>

        <div className="font-bold text-sm sm:text-base">
          ₹{item.standard_rate?.toFixed(2) ?? "0.00"}
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${stockColor}`}>
            Stock: {stockQty}
          </span>

          <Button
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full"
            onClick={handleAddToCart}
            disabled={stockQty <= 0}
          >
            +
          </Button>
        </div>
      </div>
    </div>
  )
}
