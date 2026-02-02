import { Button } from "@/components/ui/button"
import { Trash2, Plus, Minus } from "lucide-react"

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
    item_code,
    item_name,
    qty,
    rate,
    onRemove,
    onAdd,
    onReduce
}: CartItemProps) {
    const total = qty * rate

    return (
        <div className="bg-gray-50/50 rounded-lg p-3 mb-2 border border-transparent hover:border-gray-200 transition-colors">
            {/* Header: Name & Delete */}
            <div className="flex justify-between items-start mb-1">
                <h4 className="font-medium text-sm text-gray-900 line-clamp-2 pr-2">
                    {item_name}
                </h4>
                <button
                    onClick={onRemove}
                    className="text-red-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            {/* Sub-header: Code & Unit Price */}
            <div className="text-xs text-muted-foreground mb-3">
                <div className="uppercase tracking-wide text-[10px] text-gray-500 font-medium mb-0.5">
                    {item_code}
                </div>
                <div>₹{Math.floor(rate)} each</div>
            </div>

            {/* Controls Row */}
            <div className="flex justify-between items-center">
                {/* Stepper */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-white border-gray-200 text-gray-500 hover:text-gray-700"
                        onClick={onReduce}
                    >
                        <Minus className="h-3 w-3" />
                    </Button>

                    <div className="h-8 w-10 flex items-center justify-center bg-white border border-gray-200 rounded text-sm font-medium text-gray-700">
                        {qty}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-white border-gray-200 text-gray-500 hover:text-gray-700"
                        onClick={onAdd}
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>

                {/* Total Price */}
                <div className="font-bold text-base text-[#416864]"> {/* Using a custom teal shade matching screenshot */}
                    ₹{total.toFixed(2)}
                </div>
            </div>
        </div>
    )
}
