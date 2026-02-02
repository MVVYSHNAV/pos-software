import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePosStore } from "@/store/posStore"
import type { Payment } from "@/types/invoice"
import { Search, Banknote, Smartphone, CreditCard, Printer } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaymentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    total: number
    onConfirm: (payments: Payment[]) => Promise<void>
}

export function PaymentDialog({
    open,
    onOpenChange,
    total,
    onConfirm,
}: PaymentDialogProps) {
    const { profile } = usePosStore()
    const [amount, setAmount] = useState<string>("")
    const [selectedMode, setSelectedMode] = useState<string>("")
    const [processing, setProcessing] = useState(false)
    const [customerMobile, setCustomerMobile] = useState("")

    // Initialize with default payment mode and total amount when opened
    useEffect(() => {
        if (open && profile) {
            setAmount(total.toFixed(2)) // Initialize with exact amount
            const defaultMode = profile.payments.find(p => p.default)?.mode_of_payment || "Cash"
            setSelectedMode(defaultMode)
        }
    }, [open, total, profile])

    const handleConfirm = async () => {
        if (!selectedMode || !amount) return

        try {
            setProcessing(true)
            const payAmount = parseFloat(amount)

            if (isNaN(payAmount) || payAmount <= 0) {
                // In a real app we'd show an error state
                setProcessing(false)
                return
            }

            // If tendered amount is greater than total, we record the total as payment
            // and the rest is change. If less, we record logic as partial?
            const amountToRecord = payAmount >= total ? total : payAmount

            const payments: Payment[] = [{
                mode_of_payment: selectedMode,
                amount: amountToRecord
            }]

            await onConfirm(payments)
            onOpenChange(false)
        } catch (error) {
            console.error("Payment failed", error)
        } finally {
            setProcessing(false)
        }
    }

    const addCash = (value: number) => {
        const current = parseFloat(amount) || 0
        setAmount((current + value).toFixed(2)) // Keep decimals for consistency
    }

    const setExact = () => {
        setAmount(total.toFixed(2))
    }

    if (!profile) return null

    const getModeIcon = (mode: string) => {
        const m = mode.toLowerCase()
        if (m.includes("cash")) return <Banknote className="h-6 w-6 mb-2" />
        if (m.includes("upi") || m.includes("phone") || m.includes("pay")) return <Smartphone className="h-6 w-6 mb-2" />
        if (m.includes("card") || m.includes("debit") || m.includes("credit")) return <CreditCard className="h-6 w-6 mb-2" />
        return <Banknote className="h-6 w-6 mb-2" />
    }

    const currentAmount = parseFloat(amount) || 0
    const changeAmount = currentAmount > total ? currentAmount - total : 0

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
                <div className="p-6 pb-2">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-xl">Checkout</DialogTitle>
                        <DialogDescription>
                            Enter payment details and confirm to process the payment.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Customer Mobile */}
                    <div className="space-y-2 mb-6">
                        <Label className="text-sm font-semibold text-foreground/80">Customer Mobile Number</Label>
                        <div className="relative top-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="pl-9 bg-muted/30"
                                placeholder="Enter 10-digit mobile number"
                                value={customerMobile}
                                onChange={(e) => setCustomerMobile(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Payment Modes */}
                    <div className="space-y-2 mb-6">
                        <Label className="text-sm font-semibold text-foreground/80">Payment Mode</Label>
                        <div className="grid grid-cols-3 gap-4 top-2">
                            {profile.payments.slice(0, 3).map((p) => (
                                <button
                                    key={p.mode_of_payment}
                                    onClick={() => setSelectedMode(p.mode_of_payment)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-4 border rounded-xl transition-all h-24",
                                        selectedMode === p.mode_of_payment
                                            ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                                            : "border-border hover:bg-muted/50 text-muted-foreground"
                                    )}
                                >
                                    {getModeIcon(p.mode_of_payment)}
                                    <span className="font-medium text-sm">{p.mode_of_payment}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grand Total */}
                    <div className="bg-muted/20 p-4 rounded-lg flex justify-between items-center mb-6">
                        <span className="text-muted-foreground">Grand Total:</span>
                        <span className="font-bold text-lg">₹{total.toFixed(2)}</span>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2 mb-4">
                        <Label className="text-sm font-semibold text-foreground/80">Amount Collected from Customer</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="h-12 text-center text-lg font-bold bg-muted/10"
                            />
                        </div>
                    </div>

                    {/* Quick Amounts */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                        <Button variant="outline" size="sm" onClick={setExact} className="whitespace-nowrap">
                            Exact Amount
                        </Button>
                        {[100, 200, 500, 1000, 2000].map(val => (
                            <Button key={val} variant="outline" size="sm" onClick={() => addCash(val)} className="whitespace-nowrap">
                                +₹{val}
                            </Button>
                        ))}
                    </div>

                    {/* Change Return - Conditional Display */}
                    {changeAmount > 0 && (
                        <div className="bg-green-50 border-green-200 border rounded-lg p-4 flex justify-between items-center mb-2 animate-in fade-in slide-in-from-top-2">
                            <span className="text-green-800 font-semibold">Balance to Return:</span>
                            <span className="text-green-800 font-bold text-xl">₹{changeAmount.toFixed(2)}</span>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 pt-2 bg-muted/5">
                    <Button variant="outline" className="h-11 w-full" onClick={() => onOpenChange(false)} disabled={processing}>
                        Cancel
                    </Button>
                    <Button
                        className="h-11 w-full bg-emerald-700 hover:bg-emerald-800 text-white gap-2"
                        onClick={handleConfirm}
                        disabled={processing || !selectedMode}
                    >
                        <Printer className="h-4 w-4" />
                        {processing ? "Processing..." : "Confirm & Print"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
