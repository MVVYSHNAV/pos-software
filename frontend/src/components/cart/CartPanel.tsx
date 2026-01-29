import { CartSummary } from "./CartSummary"
import { Button } from "@/components/ui/button"

export function CartPanel() {
  return (
    <div className="w-full lg:w-[380px] border-l p-4 lg:p-6 flex flex-col bg-card">
      <h2 className="text-lg lg:text-xl font-semibold mb-4">
        Current Order
      </h2>

      <div className="text-sm text-muted-foreground mb-2">
        0 items
      </div>

      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        <div className="text-center">
          <p>Cart is empty</p>
          <p className="text-xs mt-1">Add items to get started</p>
        </div>
      </div>

      <CartSummary />

      <Button
        className="w-full mt-4 h-11 text-base font-medium"
        size="lg"
      >
        Checkout
      </Button>
    </div>
  )
}
