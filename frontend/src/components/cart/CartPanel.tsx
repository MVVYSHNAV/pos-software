import { useState } from "react"
import { CartSummary } from "./CartSummary"
import { Button } from "@/components/ui/button"
import { useCartStore, selectSubtotal, selectActiveItems } from "@/store/cartStore"
import { usePosStore } from "@/store/posStore"
import { CartItem } from "./CartItem"
import { PaymentDialog } from "./PaymentDialog"
import { useToast } from "@/hooks/use-toast"
import { CircleCheck } from "lucide-react"
import { useInvoiceStore } from "@/store/invoiceStore"
import { createDraftPOSInvoice } from "@/api/invoice"

import { OrderTabs } from "./OrderTabs"
import type { Customer } from "@/types/customer"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function CartPanel() {
  const { addItem, removeItem, reduceItem, clearCart, newOrder, } = useCartStore()
  const items = useCartStore(selectActiveItems)
  const subtotal = useCartStore(selectSubtotal)
  const { profile, openingEntry } = usePosStore()
  const { toast } = useToast()
  const setDraftInvoice = useInvoiceStore(s => s.setDraftInvoice)

  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [itemToRemove, setItemToRemove] = useState<string | null>(null)

  const confirmRemoval = () => {
    if (itemToRemove) {
      removeItem(itemToRemove)
      toast({
        description: (
          <div className="flex items-center gap-2">
            <CircleCheck className="h-4 w-4 text-green-600" />
            <span>Successfully removed from cart</span>
          </div>
        ),
      })
      setItemToRemove(null)
    }
  }



  const totalItems = items.reduce((sum, item) => sum + item.qty, 0)

  const handleCheckout = () => {
    if (items.length === 0) return
    setIsPaymentOpen(true)
  }

  const handlePaymentSubmit = async (payments: any[], customer?: Customer) => {
    if (!profile) {
      toast({
        title: "Error",
        description: "Session lost or invalid state",
        variant: "destructive",
      })
      return
    }

    try {
      // Create draft invoice
      const invoice = await createDraftPOSInvoice({
        customer: customer?.name || profile.customer || "Walk In Customer",
        company: profile.company,
        pos_profile: profile.name,
        pos_opening_entry: openingEntry?.name || "",
        currency: profile.currency,
        warehouse: profile.warehouse,
        items: items as any,
        payments,
      })

      if (invoice?.name) {
        setDraftInvoice(invoice.name)
      }

      toast({
        description: (
          <div className="flex items-center gap-2">
            <CircleCheck className="h-4 w-4 text-green-600" />
            <span>Order processed successfully</span>
          </div>
        ),
      })

      clearCart()
      newOrder()
      setIsPaymentOpen(false)

    } catch (error: any) {
      console.error("Checkout failed:", error)
      toast({
        title: "Checkout Failed",
        description: error.message || "Failed to process order",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="w-full h-full border-l flex flex-col bg-background shadow-sm">
      <OrderTabs />

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
                  onRemove={() => setItemToRemove(item.item_code)}
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


      <AlertDialog open={!!itemToRemove} onOpenChange={(open: boolean) => !open && setItemToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from the cart?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmRemoval}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
