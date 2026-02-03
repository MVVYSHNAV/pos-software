import { useState, useEffect } from "react"

import { TopBar } from "@/components/layout/TopBar"
import { CategoryBar } from "@/components/layout/CategoryBar"
import { ItemGrid } from "@/components/items/ItemGrid"
import { CartPanel } from "@/components/cart/CartPanel"
import { usePosStore } from "@/store/posStore"
import { useItemsStore } from "@/store/itemsStore"
import { useUserStore } from "@/store/userStore"
import { OpeningEntryError } from "@/components/layout/OpeningEntryError"
import { NoPosProfileError } from "@/components/layout/NoPosProfileError"
import { Button } from "@/components/ui/button"
import { PaymentDialog } from "@/components/cart/PaymentDialog"
import { useCartStore, selectSubtotal, selectActiveItems } from "@/store/cartStore"
import { createDraftPOSInvoice } from "@/api/invoice"
import { useInvoiceStore } from "@/store/invoiceStore"
import { useToast } from "@/hooks/use-toast"
import { CircleCheck } from "lucide-react"
import type { Customer } from "@/types/customer"

export default function Pos() {
  const { loadProfile, profile, openingEntry, loading: posLoading, error: posError } = usePosStore()
  const { fetchItems, fetchCategories, loading: itemsLoading, error: itemsError } = useItemsStore()
  const { initSession } = useUserStore()
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const activeItems = useCartStore(selectActiveItems)
  const subtotal = useCartStore(selectSubtotal)
  const { clearCart, newOrder, orders, activeOrderId } = useCartStore()
  const setDraftInvoice = useInvoiceStore(s => s.setDraftInvoice)
  const { toast } = useToast()

  useEffect(() => {
    const initialize = async () => {
      try {
        await Promise.all([
          loadProfile(),
          initSession()
        ])
      } catch (error) {
        console.error(" POS initialization failed:", error)
      }
    }
    initialize()
  }, [loadProfile])

  useEffect(() => {
    const loadData = async () => {
      if (profile?.selling_price_list) {
        try {
          await Promise.all([
            fetchItems(profile.selling_price_list),
            fetchCategories(),
          ])
          console.log(" Items and categories loaded")
        } catch (error) {
          console.error(" Failed to load items:", error)
        }
      } else {
        console.log(" Waiting for POS profile...")
      }
    }
    loadData()
  }, [profile, fetchItems, fetchCategories])

  const handlePaymentSubmit = async (payments: any[], customer?: Customer) => {
    if (!profile) {
      toast({
        title: "Error",
        description: "Session lost or invalid state",
        variant: "destructive",
      })
      return
    }

    const activeOrder = orders.find(o => o.id === activeOrderId)

    try {
      // Create draft invoice
      const invoice = await createDraftPOSInvoice({
        customer: customer?.name || profile.customer || "Walk In Customer",
        company: profile.company,
        pos_profile: profile.name,
        pos_opening_entry: openingEntry?.name || "",
        currency: profile.currency,
        warehouse: profile.warehouse,
        items: activeItems as any,
        payments,
        return_against: activeOrder?.return_against
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
        )
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

  // ...

  if (posError && posError.includes("POS Opening Entry not found")) {
    return <OpeningEntryError error={posError} />
  }

  if (posError && posError.includes("No POS Profile found for user")) {
    return <NoPosProfileError error={posError} />
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans text-gray-900">
      <TopBar />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Categories & grid */}
        <div className="flex-1 flex flex-col min-w-0 bg-white mr-[1px]">
          <CategoryBar />

          <div className="flex-1 overflow-y-auto bg-gray-50/30 p-2 md:p-4 pb-28 md:pb-0">
            {/* Error Display */}
            {(posError || itemsError) && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 mb-4 rounded">
                <p className="font-semibold">Error:</p>
                <p>{posError || itemsError}</p>
              </div>
            )}

            {/* Loading Display */}
            {(posLoading || itemsLoading) && (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading POS data...</p>
              </div>
            )}

            {!posLoading && !itemsLoading && <ItemGrid />}
          </div>
        </div>

        {/* Right Side: Cart - Hidden on mobile (< md), shown on desktop (>= md) */}
        <div className="hidden md:flex w-[380px] shrink-0 bg-white border-l h-full flex-col z-10 transition-all">
          {/* Note: CartPanel content is self-contained */}
          <CartPanel />
        </div>
      </div>

      {/* Mobile-only Fixed Checkout Bar (< md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t p-4 pb-8 safe-area-bottom">
        <Button
          onClick={() => setIsPaymentOpen(true)}
          disabled={activeItems.length === 0}
          className="w-full h-14 bg-[#52796F] hover:bg-[#416864] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:bg-gray-400 disabled:opacity-100"
        >
          <span>Checkout ({activeItems.reduce((sum, item) => sum + item.qty, 0)} items)</span>
          <span className="opacity-60 mx-1">•</span>
          <span>₹{subtotal.toFixed(2)}</span>
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
