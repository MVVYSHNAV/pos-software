export function CartSummary() {
  return (
    <div className="border-t pt-4 space-y-2 text-sm">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>₹0.00</span>
      </div>

      <div className="flex justify-between">
        <span>Tax (18%)</span>
        <span>₹0.00</span>
      </div>

      <div className="flex justify-between font-semibold">
        <span>Grand Total</span>
        <span>₹0.00</span>
      </div>
    </div>
  )
}
