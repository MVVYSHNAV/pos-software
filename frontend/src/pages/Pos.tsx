import { useEffect } from "react"

import { TopBar } from "@/components/layout/TopBar"
import { CategoryBar } from "@/components/layout/CategoryBar"
import { ItemGrid } from "@/components/items/ItemGrid"
import { CartPanel } from "@/components/cart/CartPanel"
import { usePosStore } from "@/store/posStore"
import { useItemsStore } from "@/store/itemsStore"
import { useUserStore } from "@/store/userStore"


export default function Pos() {
  const { boot, profile, loading: posLoading, error: posError } = usePosStore()
  const { fetchItems, fetchCategories, loading: itemsLoading, error: itemsError } = useItemsStore()
  const { initSession } = useUserStore()

  useEffect(() => {
    const initialize = async () => {
      try {
        await Promise.all([
          boot(),
          initSession()
        ])
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

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans text-gray-900">
      <TopBar />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Categories & grid */}
        <div className="flex-1 flex flex-col min-w-0 bg-white mr-[1px]"> {/* mr-px for divider effect */}
          <CategoryBar />

          <div className="flex-1 overflow-y-auto bg-gray-50/30 p-4">
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

        {/* Right Side: Cart */}
        <div className="w-[400px] bg-white border-l h-full flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
          {/* Note: CartPanel content is self-contained */}
          <CartPanel />
        </div>
      </div>
    </div>
  )
}
