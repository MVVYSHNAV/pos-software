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
import { usePosStore } from "@/store/posStore"
import type { Payment } from "@/types/invoice"
import { Printer } from "lucide-react"
import type { Customer } from "@/types/customer"
import { CustomerSearch } from "./payment/CustomerSearch"
import { PaymentModeGrid } from "./payment/PaymentModeGrid"
import { AmountControl } from "./payment/AmountControl"
import { ChangeDisplay } from "./payment/ChangeDisplay"

interface PaymentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    total: number
    onConfirm: (payments: Payment[], customer?: Customer) => Promise<void>
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
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>()

    // Initialize with default payment mode and total amount when opened
    useEffect(() => {
        if (open && profile) {
            setAmount(total.toFixed(2)) // Initialize with exact amount
            const defaultMode = profile.payments.find(p => p.default)?.mode_of_payment || "Cash"
            setSelectedMode(defaultMode)
            // Customer fetching is now handled by CustomerSearch component lazily or on mount
        }
    }, [open, total, profile])

    const handleConfirm = async () => {
        if (!selectedMode || !amount) return

        try {
            setProcessing(true)
            const payAmount = parseFloat(amount) || 0

            if (payAmount <= 0) {
                setProcessing(false)
                return
            }

            const amountToRecord = payAmount >= total ? total : payAmount

            const payments: Payment[] = [{
                mode_of_payment: selectedMode,
                amount: amountToRecord
            }]

            await onConfirm(payments, selectedCustomer)
            onOpenChange(false)
        } catch (error) {
            console.error("Payment failed", error)
        } finally {
            setProcessing(false)
        }
    }

    if (!profile) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="fixed z-50 flex flex-col w-full h-[100dvh] max-w-none rounded-none border-0 p-0 sm:h-auto sm:max-w-3xl sm:rounded-lg sm:border sm:gap-0 bg-background">
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-2">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-xl">Checkout</DialogTitle>
                        <DialogDescription>
                            Enter payment details and confirm to process the payment.
                        </DialogDescription>
                    </DialogHeader>

                    <CustomerSearch
                        selectedCustomer={selectedCustomer}
                        onSelect={setSelectedCustomer}
                    />

                    <PaymentModeGrid
                        modes={profile.payments}
                        selectedMode={selectedMode}
                        onSelect={setSelectedMode}
                    />

                    {/* Grand Total */}
                    <div className="bg-muted/20 p-4 rounded-lg flex justify-between items-center mb-6">
                        <span className="text-muted-foreground">Grand Total:</span>
                        <span className="font-bold text-lg">₹{total.toFixed(2)}</span>
                    </div>

                    <AmountControl
                        amount={amount}
                        setAmount={setAmount}
                        total={total}
                    />

                    <ChangeDisplay
                        amount={amount}
                        total={total}
                    />
                </div>

                <DialogFooter className="p-4 sm:p-6 pt-2 bg-white sm:bg-white border-t sm:border-t-0 mt-auto flex-row gap-3">
                    <Button
                        variant="outline"
                        className="h-12 flex-1 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 text-base font-medium"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="h-12 flex-1 bg-[#52796F] hover:bg-[#43645B] text-white gap-2 rounded-xl text-base font-medium shadow-sm"
                        onClick={handleConfirm}
                        disabled={processing || !selectedMode || !selectedCustomer}
                    >
                        <Printer className="h-5 w-5" />
                        {processing ? "Processing..." : "Confirm & Print"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
