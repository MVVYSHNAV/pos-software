import { CartSummary } from "./CartSummary"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cartStore"
import { CartItem } from "./CartItem"

export function CartPanel() {
  const { items, addItem, removeItem, reduceItem, clearCart, orderNumber } = useCartStore()

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0)

  return (
    <div className="w-full lg:w-[380px] border-l p-4 lg:p-6 flex flex-col bg-card h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg lg:text-xl font-semibold">
          Current Order #{orderNumber}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {totalItems} items
          </span>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive border-1 border-red-500 hover:bg-destructive/10 hover:text-destructive h-7 px-2"
              onClick={clearCart}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto -mx-2 px-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
            <p>Cart is empty</p>
            <p className="text-xs mt-1">Add items to get started</p>
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item) => (
              <CartItem
                key={item.item_code}
                {...item}
                onAdd={() => addItem({
                  item_code: item.item_code,
                  item_name: item.item_name,
                  rate: item.rate
                })}
                onReduce={() => reduceItem(item.item_code)}
                onRemove={() => removeItem(item.item_code)}
              />
            ))}
          </div>
        )}
      </div>

      <CartSummary />

      <Button
        className="w-full mt-4 h-11 text-base font-medium"
        size="lg"
        disabled={items.length === 0}
      >
        Checkout
      </Button>
    </div>
  )
}
