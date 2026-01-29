import { Button } from "@/components/ui/button"

export function ItemCard() {
  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="h-40 bg-muted" />

      <div className="p-4 space-y-2">
        <div className="font-semibold">
          Coca Cola 500ml
        </div>

        <div className="text-xs text-muted-foreground">
          BEV-001
        </div>

        <div className="font-bold">₹40</div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-green-600">
            Stock: 120
          </span>

          <Button size="icon">+</Button>
        </div>
      </div>
    </div>
  )
}
