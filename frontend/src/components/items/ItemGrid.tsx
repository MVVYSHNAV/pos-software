import { ItemCard } from "./ItemCard"
import { useItemsStore } from "@/store/itemsStore"
import { useEffect, useRef, useCallback } from "react"
import { Loader2 } from "lucide-react"

export function ItemGrid() {
  const { getFilteredItems, loading, loadingMore, hasMore, loadMoreItems } = useItemsStore()
  const items = getFilteredItems()
  const observerTarget = useRef<HTMLDivElement>(null)
  const priceListRef = useRef<string>("")

  // Get price list from localStorage or context (assuming it's stored there)
  useEffect(() => {
    const posProfile = localStorage.getItem("pos_profile")
    if (posProfile) {
      try {
        const profile = JSON.parse(posProfile)
        priceListRef.current = profile.selling_price_list || ""
      } catch (e) {
        console.error("Failed to parse pos_profile", e)
      }
    }
  }, [])

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries
    if (target.isIntersecting && hasMore && !loadingMore && priceListRef.current) {
      loadMoreItems(priceListRef.current)
    }
  }, [hasMore, loadingMore, loadMoreItems])

  useEffect(() => {
    const element = observerTarget.current
    if (!element) return

    const option = {
      root: null,
      rootMargin: "200px", // Start loading 200px before reaching the bottom
      threshold: 0
    }

    const observer = new IntersectionObserver(handleObserver, option)
    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [handleObserver])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No items found</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-10 mb-0">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {items.map((item) => (
          <ItemCard key={item.item_code} item={item} />
        ))}
      </div>

      {/* Intersection observer target */}
      <div ref={observerTarget} className="h-20 flex items-center justify-center">
        {loadingMore && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading more items...</span>
          </div>
        )}
      </div>
    </div>
  )
}
