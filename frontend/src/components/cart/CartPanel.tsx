import { CartSummary } from "./CartSummary"

export function CartPanel() {
  return (
    <div className="w-[380px] border-l p-6 flex flex-col">
      <h2 className="text-xl font-semibold mb-4">
        Current Order
      </h2>

      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Cart is empty
      </div>

      <CartSummary />
    </div>
  )
}
