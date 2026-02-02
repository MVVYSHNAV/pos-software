import { Button } from "@/components/ui/button"
import { X, Plus, Minus } from "lucide-react"

interface CartItemProps {
    item_code: string
    item_name: string
    qty: number
    rate: number
    onRemove: () => void
    onAdd: () => void
    onReduce: () => void
}

export function CartItem({
    item_name,
    qty,
    rate,
    onRemove,
    onAdd,
    onReduce
}: CartItemProps) {
    const total = qty * rate

    return (
        <div className="flex items-start justify-between py-3 border-b last:border-0">
            <div className="flex-1 space-y-1">
                <div className="text-sm font-medium line-clamp-2 pr-2">
                    {item_name}
                </div>
                <div className="text-xs text-muted-foreground">
                    ₹{rate.toFixed(2)} x {qty}
                </div>
            </div>

            <div className="flex flex-col items-end gap-2">
                <div className="font-semibold text-sm">
                    ₹{total.toFixed(2)}
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onReduce}
                    >
                        <Minus className="h-3 w-3" />
                    </Button>

                    <span className="text-xs w-6 text-center font-medium">
                        {qty}
                    </span>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onAdd}
                    >
                        <Plus className="h-3 w-3" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 ml-1"
                        onClick={onRemove}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
