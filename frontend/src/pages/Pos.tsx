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
import type { Customer } from "@/types/customer"
import { useCheckout } from "@/hooks/useCheckout"

export default function Pos() {
  const { loadProfile, profile, loading: posLoading, error: posError } = usePosStore()
  const { fetchItems, fetchCategories, loading: itemsLoading, error: itemsError } = useItemsStore()
  const { initSession } = useUserStore()
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const activeItems = useCartStore(selectActiveItems)
  const subtotal = useCartStore(selectSubtotal)

  const { processPayment } = useCheckout()

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


  const handlePaymentConfirm = async (payments: any[], customer?: Customer) => {
    const success = await processPayment(payments, customer)
    if (success) {
      setIsPaymentOpen(false)
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
        onConfirm={handlePaymentConfirm}
      />
    </div>
  )
}
