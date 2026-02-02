import { useState } from "react"
import { CartSummary } from "./CartSummary"
import { Button } from "@/components/ui/button"
import { useCartStore, selectSubtotal } from "@/store/cartStore"
import { usePosStore } from "@/store/posStore"
import { CartItem } from "./CartItem"
import { PaymentDialog } from "./PaymentDialog"
import { useToast } from "@/hooks/use-toast"

import { Plus } from "lucide-react"

export function CartPanel() {
  const { items, addItem, removeItem, reduceItem, clearCart, orderNumber, newOrder } = useCartStore()
  const subtotal = useCartStore(selectSubtotal)
  const { profile } = usePosStore()
  const { toast } = useToast()

  const [isPaymentOpen, setIsPaymentOpen] = useState(false)


  const totalItems = items.reduce((sum, item) => sum + item.qty, 0)

  const handleCheckout = () => {
    if (items.length === 0) return
    setIsPaymentOpen(true)
  }

  const handlePaymentSubmit = async () => {
    if (!profile) {
      toast({
        title: "Error",
        description: "Session lost or invalid state",
        variant: "destructive",
      })
      return
    }

    try {
      // Simulate successful checkout
      await new Promise(resolve => setTimeout(resolve, 500))

      toast({
        title: "Order Complete",
        description: "Order processed successfully",
      })

      clearCart()
      newOrder()
      setIsPaymentOpen(false)

    } catch (error: any) {
      console.error("Checkout failed:", error)
      toast({
        title: "Checkout Failed",
        description: "Failed to process order",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="w-full lg:w-[400px] border-l flex flex-col bg-background h-full shadow-sm">
      {/* Order Tabs */}
      <div className="flex border-b pl-2 pt-2 bg-muted/20">
        <div className="px-4 py-2 bg-background border-t border-x rounded-t-lg text-sm font-medium border-b-0 -mb-[1px] cursor-default text-emerald-900">
          Order #{orderNumber}
          {/* <span className="text-muted-foreground ml-1">({totalItems})</span> */}
        </div>
        <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1" onClick={newOrder}>
          <Plus className="h-3 w-3" />
          New Order
        </button>
      </div>

      <div className="p-4 lg:p-6 flex flex-col h-full">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-emerald-950">
            Current Order
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalItems} items
          </p>
        </div>

        <div className="flex-1 overflow-y-auto -mx-2 px-2">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
              <p className="text-lg">Cart is empty</p>
              <p className="text-sm mt-1">Add items to get started</p>
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
          className="w-full mt-4 h-12 text-base font-medium bg-[#52796F] hover:bg-[#8CA59E] text-white shadow-none rounded-md"
          size="lg"
          disabled={items.length === 0}
          onClick={handleCheckout}
        >
          Checkout
        </Button>
      </div>

      <PaymentDialog
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        total={subtotal}
        onConfirm={handlePaymentSubmit}
      />
    </div>
  )
}
