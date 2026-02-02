import { Button } from "@/components/ui/button"
import type { Item } from "@/types/item"
import { useCartStore } from "@/store/cartStore"
import { Plus, Info } from "lucide-react"

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
  const stockColor = stockQty > 0 ? "text-green-600" : "text-red-500"

  return (
    <div className="bg-white rounded-lg overflow-hidden border hover:shadow-md transition-all flex flex-col group">
      {/* Image Container - Fixed Aspect Ratio */}
      <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.item_name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 min-h-[2.5rem] leading-snug">
          {item.item_name}
        </h3>

        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          {item.item_code}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2">
          <div>
            <span className="text-lg font-bold text-gray-800">
              ₹{Math.floor(item.standard_rate ?? 0)}
            </span>
            <div className={`text-[10px] font-medium mt-0.5 ${stockColor}`}>
              Stock: {stockQty}
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
            <Button
              size="icon"
              className="h-7 w-7 rounded-full bg-[#526471] hover:bg-[#43535e] shadow-sm"
              onClick={handleAddToCart}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
