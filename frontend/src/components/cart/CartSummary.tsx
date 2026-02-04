import { useCartStore, selectSubtotal } from "@/store/cartStore"

export function CartSummary() {
  const subtotal = useCartStore(selectSubtotal)
  const tax = 0.00
  const grandTotal = subtotal + tax

  return (
    <div className="border-t pt-4 space-y-2 text-sm text-emerald-950/80">
      <div className="flex justify-between">
        <span>Subtotal:</span>
        <span>₹{subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax (18%):</span>
        <span>₹{tax.toFixed(2)}</span>
      </div>

      <div className="flex justify-between font-bold text-lg pt-2 border-t text-emerald-950">
        <span>Grand Total:</span>
        <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
      </div>
    </div>
  )
}
