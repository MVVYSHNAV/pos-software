import { useCartStore } from "@/store/cartStore"

export function CartSummary() {
  const subtotal = useCartStore(state => state.subtotal)

  // Assuming 18% tax as per the static design
  const tax = subtotal * 0.18
  const grandTotal = subtotal + tax

  return (
    <div className="border-t pt-4 space-y-3 text-sm">
      <div className="flex justify-between text-muted-foreground">
        <span>Subtotal:</span>
        <span>₹{subtotal.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-muted-foreground">
        <span>Tax (18%):</span>
        <span>₹{tax.toFixed(2)}</span>
      </div>

      <div className="flex justify-between font-bold text-base pt-2 border-t">
        <span>Grand Total:</span>
        <span>₹{grandTotal.toFixed(2)}</span>
      </div>
    </div>
  )
}
