import { Banknote, Smartphone, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import type { POSProfile } from "@/types/pos"

interface PaymentModeGridProps {
    modes: POSProfile["payments"]
    selectedMode: string
    onSelect: (mode: string) => void
}

export function PaymentModeGrid({ modes, selectedMode, onSelect }: PaymentModeGridProps) {
    const getModeIcon = (mode: string) => {
        const m = mode.toLowerCase()
        if (m.includes("cash")) return <Banknote className="h-6 w-6 mb-2" />
        if (m.includes("upi") || m.includes("phone") || m.includes("pay")) return <Smartphone className="h-6 w-6 mb-2" />
        if (m.includes("card") || m.includes("debit") || m.includes("credit")) return <CreditCard className="h-6 w-6 mb-2" />
        return <Banknote className="h-6 w-6 mb-2" />
    }

    return (
        <div className="space-y-3 mb-6">
            <Label className="text-sm font-semibold text-foreground/80">Payment Mode</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 top-2 py-2">
                {modes.slice(0, 3).map((p) => (
                    <button
                        key={p.mode_of_payment}
                        onClick={() => onSelect(p.mode_of_payment)}
                        className={cn(
                            "flex flex-col items-center justify-center p-4 border rounded-xl transition-all h-24",
                            selectedMode === p.mode_of_payment
                                ? "border-[#52796F] bg-[#52796F]/5 text-[#52796F] ring-1 ring-[#52796F]"
                                : "border-border hover:bg-muted/50 text-muted-foreground"
                        )}
                    >
                        {getModeIcon(p.mode_of_payment)}
                        <span className="font-medium text-sm">{p.mode_of_payment}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
