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
import { Search, Banknote, Smartphone, CreditCard, Printer, User, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCustomers, createCustomer, getCustomerByMobile } from "@/api/customer"
import type { Customer } from "@/types/customer"
import { useToast } from "@/hooks/use-toast"

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
    const { toast } = useToast()
    const { profile } = usePosStore()
    const [amount, setAmount] = useState<string>("")
    const [selectedMode, setSelectedMode] = useState<string>("")
    const [processing, setProcessing] = useState(false)
    const [customerMobile, setCustomerMobile] = useState("")
    const [customers, setCustomers] = useState<Customer[]>([])
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isAddingCustomer, setIsAddingCustomer] = useState(false)
    const [newCustomerName, setNewCustomerName] = useState("")
    const [isCreating, setIsCreating] = useState(false)

    // Initialize with default payment mode and total amount when opened
    useEffect(() => {
        if (open && profile) {
            setAmount(total.toFixed(2)) // Initialize with exact amount
            const defaultMode = profile.payments.find(p => p.default)?.mode_of_payment || "Cash"
            setSelectedMode(defaultMode)

            // Fetch top 5 customers
            getCustomers().then(setCustomers).catch(console.error)
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

    const handleAddCustomer = async () => {
        if (!newCustomerName || !customerMobile) return

        try {
            setIsCreating(true)

            // Check if customer already exists
            const existing = await getCustomerByMobile(customerMobile)
            if (existing) {
                toast({
                    title: "Customer Exists",
                    description: `Customer with mobile ${customerMobile} already exists: ${existing.customer_name}`,
                })
                setSelectedCustomer(existing)
                setIsAddingCustomer(false)
                setNewCustomerName("")
                return
            }

            const newCustomer = await createCustomer({
                customer_name: newCustomerName,
                mobile_no: customerMobile
            })
            const customersList = await getCustomers()
            setCustomers(customersList)
            const created = customersList.find(c => c.name === newCustomer.name)
            if (created) {
                setSelectedCustomer(created)
                setCustomerMobile(created.mobile_no || "")
            }
            setIsAddingCustomer(false)
            setNewCustomerName("")
        } catch (error) {
            console.error("Failed to create customer", error)
            toast({
                title: "Error",
                description: "Failed to create customer record",
                variant: "destructive",
            })
        } finally {
            setIsCreating(false)
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
    const balance = currentAmount - total
    const isChange = balance >= 0
    const displayAmount = Math.abs(balance)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="fixed z-50 flex flex-col w-full h-[100dvh] max-w-none rounded-none border-0 p-0 sm:h-auto sm:max-w-4xl sm:rounded-lg sm:border sm:gap-0 bg-background">
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-2">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-xl">Checkout</DialogTitle>
                        <DialogDescription>
                            Enter payment details and confirm to process the payment.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Customer Mobile & Search */}
                    <div className="space-y-2 mb-6 relative">
                        <Label className="text-sm font-semibold text-foreground/80">Customer Mobile Number</Label>
                        <div className="relative top-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="pl-9 bg-white h-11 border-[#52796F]/40 border-2 rounded-xl"
                                placeholder="Enter 10-digit mobile number"
                                value={customerMobile}
                                onFocus={() => setIsDropdownOpen(true)}
                                onChange={(e) => {
                                    const value = e.target.value
                                    setCustomerMobile(value)
                                    if (selectedCustomer && selectedCustomer.mobile_no !== value) {
                                        setSelectedCustomer(undefined)
                                    }

                                    // Debounce or just call for now (can optimize later if needed)
                                    getCustomers(value).then(setCustomers)

                                    setIsDropdownOpen(true)
                                }}
                            />
                            <ChevronDown className={cn(
                                "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform duration-200",
                                isDropdownOpen && "rotate-180"
                            )} />
                        </div>

                        {/* Customer Dropdown (Command Style) */}
                        {isDropdownOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 top-full">
                                <div className="p-1">
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        SearchResults
                                    </div>
                                    {customers.map((c) => (
                                        <button
                                            key={c.name}
                                            type="button"
                                            onClick={() => {
                                                setCustomerMobile(c.mobile_no || "")
                                                setSelectedCustomer(c)
                                                setIsDropdownOpen(false)
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-md transition-colors",
                                                selectedCustomer?.name === c.name
                                                    ? "bg-primary/10 text-primary"
                                                    : "hover:bg-muted text-foreground"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col items-start translate-y-[-1px]">
                                                    <span className="font-medium">{c.customer_name}</span>
                                                    {c.mobile_no && <span className="text-xs text-muted-foreground">{c.mobile_no}</span>}
                                                </div>
                                            </div>
                                            {selectedCustomer?.name === c.name && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
                                        </button>
                                    ))}
                                    {/* Empty State */}
                                    {customers.length === 0 && !isAddingCustomer && (
                                        <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                                            No customers found matching "{customerMobile}"
                                        </div>
                                    )}

                                    {/* Always show Add New Customer button if not currently adding */}
                                    {!isAddingCustomer && (
                                        <div className="p-1 border-t mt-1">
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingCustomer(true)}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-primary/5 text-primary font-medium transition-colors"
                                            >
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <span>Add "{customerMobile || "New"}" as New Customer</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* Inline Add Customer Form */}
                                    {isAddingCustomer && (
                                        <div className="p-3 border-t bg-muted/20">
                                            <p className="text-xs font-semibold mb-2 text-primary">New Customer Details</p>
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase text-muted-foreground">Mobile Number</Label>
                                                    <Input
                                                        value={customerMobile}
                                                        onChange={(e) => setCustomerMobile(e.target.value)}
                                                        className="h-9 text-sm"
                                                        placeholder="Enter mobile number..."
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase text-muted-foreground">Full Name</Label>
                                                    <Input
                                                        autoFocus
                                                        placeholder="Enter customer name..."
                                                        value={newCustomerName}
                                                        onChange={(e) => setNewCustomerName(e.target.value)}
                                                        className="h-9 text-sm"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 h-9"
                                                        onClick={handleAddCustomer}
                                                        disabled={isCreating || !newCustomerName}
                                                    >
                                                        {isCreating ? "Creating..." : "Create & Select"}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-9"
                                                        onClick={() => setIsAddingCustomer(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* Overlay to close dropdown */}
                        {isDropdownOpen && (
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsDropdownOpen(false)}
                            />
                        )}
                    </div>

                    {/* Payment Modes */}
                    <div className="space-y-3 mb-6">
                        <Label className="text-sm font-semibold text-foreground/80">Payment Mode</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 top-2 py-2">
                            {profile.payments.slice(0, 3).map((p) => (
                                <button
                                    key={p.mode_of_payment}
                                    onClick={() => setSelectedMode(p.mode_of_payment)}
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

                    {/* Grand Total */}
                    <div className="bg-muted/20 p-4 rounded-lg flex justify-between items-center mb-6">
                        <span className="text-muted-foreground">Grand Total:</span>
                        <span className="font-bold text-lg">₹{total.toFixed(2)}</span>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2 mb-4">
                        <Label className="text-sm font-semibold text-foreground/80">Amount Collected from Customer</Label>
                        <div className="relative py-2">
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="h-12 text-center text-lg font-bold bg-muted/10"
                            />
                        </div>
                    </div>

                    {/* Quick Amounts */}
                    <div className="flex gap-2 mb-4 overflow-x-auto p-2 scrollbar-hide">
                        <Button variant="outline" size="sm" onClick={setExact} className="whitespace-nowrap">
                            Exact Amount
                        </Button>
                        {[100, 200, 500, 1000, 2000].map(val => (
                            <Button key={val} variant="outline" size="sm" onClick={() => addCash(val)} className="whitespace-nowrap">
                                +₹{val}
                            </Button>
                        ))}
                    </div>

                    {/* Balance/Change Display */}
                    {Math.abs(currentAmount - total) > 0.01 && (
                        <div className={cn(
                            "border rounded-lg p-4 flex justify-between items-center mb-2 animate-in fade-in slide-in-from-top-2",
                            isChange ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
                        )}>
                            <span className={cn("font-semibold", isChange ? "text-green-800" : "text-orange-800")}>
                                {isChange ? "Change to Return:" : "Balance Due:"}
                            </span>
                            <span className={cn("font-bold text-xl", isChange ? "text-green-800" : "text-orange-800")}>
                                ₹{displayAmount.toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-4 sm:p-6 pt-2 bg-muted/5 border-t sm:border-t-0 mt-auto">
                    <Button variant="outline" className="h-12 sm:h-11 flex-1 sm:flex-none" onClick={() => onOpenChange(false)} disabled={processing}>
                        Cancel
                    </Button>
                    <Button
                        className="h-12 sm:h-11 flex-[2] sm:flex-none bg-emerald-700 hover:bg-emerald-800 text-white gap-2"
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
