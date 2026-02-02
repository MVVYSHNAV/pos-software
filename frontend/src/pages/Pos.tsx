import { useEffect } from "react"
import PageShell from "@/components/layout/PageShell"
import { TopBar } from "@/components/layout/TopBar"
import { CategoryBar } from "@/components/layout/CategoryBar"
import { ItemGrid } from "@/components/items/ItemGrid"
import { CartPanel } from "@/components/cart/CartPanel"
import { usePosStore } from "@/store/posStore"
import { useItemsStore } from "@/store/itemsStore"
import { InvoiceTab } from "@/components/layout/InvoiceTab"

export default function Pos() {
  const { boot, profile, loading: posLoading, error: posError } = usePosStore()
  const { fetchItems, fetchCategories, items, loading: itemsLoading, error: itemsError } = useItemsStore()

  useEffect(() => {
    const initialize = async () => {
      try {
        await boot()
      } catch (error) {
        console.error(" POS boot failed:", error)
      }
    }
    initialize()
  }, [boot])

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

  // Debug logging
  console.log(" POS State:", {
    profile,
    posLoading,
    posError,
    itemsCount: items.length,
    itemsLoading,
    itemsError
  })

  return (
    <PageShell>
      <TopBar />
      <div className="flex flex-col lg:flex-row">
        <CategoryBar />
        <InvoiceTab />
      </div>


      {/* Error Display */}
      {(posError || itemsError) && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 mx-6 mt-4 rounded">
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

      <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)]">
        <div className="flex-1 overflow-y-auto">
          <ItemGrid />
        </div>

        <div className="hidden lg:flex lg:h-full">
          <CartPanel />
        </div>

        {/* Mobile cart - could be implemented as a bottom sheet or modal later */}
        <div className="lg:hidden border-t">
          <CartPanel />
        </div>
      </div>
    </PageShell>
  )
}
