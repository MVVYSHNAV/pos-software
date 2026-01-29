import PageShell from "@/components/layout/PageShell"
import { TopBar } from "@/components/layout/TopBar"
import { CategoryBar } from "@/components/layout/CategoryBar"
import { ItemGrid } from "@/components/items/ItemGrid"
import { CartPanel } from "@/components/cart/CartPanel"

export default function Pos() {
  return (
    <PageShell>
      <TopBar />
      <CategoryBar />

      <div className="flex h-[calc(100vh-120px)]">
        <div className="flex-1 overflow-y-auto">
          <ItemGrid />
        </div>

        <CartPanel />
      </div>
    </PageShell>
  )
}
