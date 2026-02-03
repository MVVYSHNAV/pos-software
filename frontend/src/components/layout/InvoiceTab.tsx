import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cartStore"

export function InvoiceTab() {
  const orderNumber = useCartStore(state => state.activeOrderId)
  const newOrder = useCartStore(state => state.newOrder)

  return (
    <div className="flex items-center justify-between border-b p-3">
      <div className="flex items-center gap-2">
        <div className="px-3 py-1 border rounded">
          Order #{orderNumber}
        </div>

        <Button
          variant="outline"
          onClick={newOrder}
        >
          + New Order
        </Button>
      </div>
    </div>
  )
}
