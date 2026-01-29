export function CartSummary() {
  return (
    <div className="border-t pt-4 space-y-3 text-sm">
      <div className="flex justify-between text-muted-foreground">
        <span>Subtotal:</span>
        <span>₹0.00</span>
      </div>

      <div className="flex justify-between text-muted-foreground">
        <span>Tax (18%):</span>
        <span>₹0.00</span>
      </div>

      <div className="flex justify-between font-bold text-base pt-2 border-t">
        <span>Grand Total:</span>
        <span>₹0.00</span>
      </div>
    </div>
  )
}
