import { Dialog, DialogContent } from "@/components/ui/dialog"
import { FileText, Loader2, Minus, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { getPaidInvoices, getInvoice, createDraftPOSInvoice } from "@/api/invoice"
import { checkIfInvoiceHasReturn } from "@/api/returnCheck"
import { formatCurrency } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { usePosStore } from "@/store/posStore"
import { useToast } from "@/hooks/use-toast"

interface CreditNoteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

interface ItemSelection {
    selected: boolean
    qty: number
    maxQty: number
}

export function CreditNoteDialog({ open, onOpenChange }: CreditNoteDialogProps) {
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedInvoiceInfo, setSelectedInvoiceInfo] = useState<any>(null)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [selectedItems, setSelectedItems] = useState<Record<string, ItemSelection>>({})
    const { toast } = useToast()

    useEffect(() => {
        if (open) {
            loadInvoices()
            setSelectedInvoiceInfo(null)
            setSelectedItems({})
        }
    }, [open])

    useEffect(() => {
        if (selectedInvoiceInfo?.items) {
            const initialItems: Record<string, ItemSelection> = {}
            selectedInvoiceInfo.items.forEach((item: any) => {
                initialItems[item.name] = {
                    selected: true,
                    qty: Math.abs(item.qty),
                    maxQty: Math.abs(item.qty)
                }
            })
            setSelectedItems(initialItems)
        }
    }, [selectedInvoiceInfo])

    const loadInvoices = async () => {
        setLoading(true)
        try {
            const data = await getPaidInvoices()
            setInvoices(data)
        } catch (error) {
            console.error("Failed to load invoices", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectInvoice = async (invoice: any) => {
        setLoadingDetails(true)
        try {
            const data = await getInvoice(invoice.name)
            const hasReturn = await checkIfInvoiceHasReturn(invoice.name)
            setSelectedInvoiceInfo({ ...data, hasReturn })
        } catch (error) {
            console.error("Failed to load invoice details", error)
        } finally {
            setLoadingDetails(false)
        }
    }

    const toggleItemSelection = (itemName: string) => {
        setSelectedItems(prev => ({
            ...prev,
            [itemName]: { ...prev[itemName], selected: !prev[itemName].selected }
        }))
    }

    const updateItemQty = (itemName: string, delta: number) => {
        setSelectedItems(prev => {
            const current = prev[itemName]
            const newQty = Math.max(1, Math.min(current.maxQty, current.qty + delta))
            return {
                ...prev,
                [itemName]: { ...current, qty: newQty }
            }
        })
    }

    const selectAll = () => {
        setSelectedItems(prev => {
            const updated = { ...prev }
            Object.keys(updated).forEach(key => {
                updated[key] = { ...updated[key], selected: true }
            })
            return updated
        })
    }

    const clearAll = () => {
        setSelectedItems(prev => {
            const updated = { ...prev }
            Object.keys(updated).forEach(key => {
                updated[key] = { ...updated[key], selected: false }
            })
            return updated
        })
    }

    const getSelectedItemsCount = () => {
        return Object.values(selectedItems).filter(item => item.selected).length
    }

    const getTotalItems = () => {
        return Object.keys(selectedItems).length
    }

    const getTotalCreditAmount = () => {
        if (!selectedInvoiceInfo?.items) return 0
        return selectedInvoiceInfo.items.reduce((total: number, item: any) => {
            const itemState = selectedItems[item.name]
            if (itemState?.selected) {
                return total + (item.rate * itemState.qty)
            }
            return total
        }, 0)
    }

    const handleIssueCreditNote = async () => {
        if (!selectedInvoiceInfo) return

        if (selectedInvoiceInfo.hasReturn) {
            toast({
                description: "This invoice has already been returned.",
                variant: "destructive"
            })
            return
        }

        const selectedItemsList = selectedInvoiceInfo.items.filter((item: any) => selectedItems[item.name]?.selected)

        if (selectedItemsList.length === 0) {
            toast({
                description: "Please select at least one item to return.",
                variant: "destructive"
            })
            return
        }

        try {
            // Get POS profile and opening entry from store
            const { profile, openingEntry } = usePosStore.getState()

            if (!profile || !openingEntry) {
                toast({
                    title: "Error",
                    description: "POS profile or opening entry not found. Please reload the page.",
                    variant: "destructive"
                })
                return
            }

            // Calculate total refund amount
            const totalRefund = selectedItemsList.reduce((total: number, item: any) => {
                const itemState = selectedItems[item.name]
                return total + (item.rate * itemState.qty)
            }, 0)

            // Prepare items with negative quantities for return
            const returnItems = selectedItemsList.map((item: any) => ({
                item_code: item.item_code,
                item_name: item.item_name || item.item_code,
                qty: -1 * selectedItems[item.name].qty, // Negative quantity for return
                rate: item.rate,
                pos_invoice_item: item.name // Link to original invoice item
            }))

            // Create payment for refund (negative amount)
            const refundPayment = {
                mode_of_payment: "Cash", // Default to cash refund
                amount: -1 * totalRefund // Negative amount for refund
            }

            // Create the credit note (return invoice)
            const creditNote = await createDraftPOSInvoice({
                customer: selectedInvoiceInfo.customer,
                company: profile.company,
                pos_profile: profile.name,
                pos_opening_entry: openingEntry.name,
                currency: profile.currency,
                warehouse: profile.warehouse,
                items: returnItems as any,
                payments: [refundPayment],
                return_against: selectedInvoiceInfo.name // Link to original invoice
            })

            if (creditNote?.name) {
                toast({
                    title: "Success",
                    description: `Credit Note ${creditNote.name} created successfully!`,
                })
                onOpenChange(false)
                // Optionally refresh the invoice list
                loadInvoices()
            }
        } catch (error: any) {
            console.error("Failed to create credit note:", error)
            toast({
                title: "Error",
                description: error.message || "Failed to create credit note",
                variant: "destructive"
            })
        }
    }

    // Detail view with redesigned UI
    if (selectedInvoiceInfo || loadingDetails) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-[950px] w-full p-0 gap-0 bg-white max-h-[90vh] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col">
                    {loadingDetails ? (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-[#065F46]" />
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200 flex items-start justify-between">
                                <div>
                                    <h2 className="text-[22px] font-semibold text-gray-900">Issue Credit Note</h2>
                                    <p className="text-sm text-[#6B7280] mt-1">Select items and quantities for credit note</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                {/* Invoice Information Card */}
                                <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-5 mb-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900">{selectedInvoiceInfo.name}</h3>
                                            <p className="text-[15px] font-medium text-gray-900 mt-1">{selectedInvoiceInfo.customer}</p>
                                            <p className="text-sm text-[#6B7280]">{selectedInvoiceInfo.contact_mobile || selectedInvoiceInfo.mobile_no}</p>
                                        </div>
                                        <span className="px-3 py-1.5 bg-[#DCFCE7] text-[#166534] text-xs font-semibold rounded-full uppercase">
                                            {selectedInvoiceInfo.status}
                                        </span>
                                    </div>

                                    <div className="border-t border-gray-200 pt-4 mt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-base font-medium text-gray-700">Invoice Total:</span>
                                            <span className="text-lg font-semibold text-gray-900">{formatCurrency(selectedInvoiceInfo.grand_total)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Select Items Section Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-base font-semibold text-gray-900">Select Items for Credit Note</h4>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={selectAll}
                                            className="px-3.5 py-2 border border-[#D1D5DB] rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Select All
                                        </button>
                                        <button
                                            onClick={clearAll}
                                            className="px-3.5 py-2 border border-[#D1D5DB] rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="space-y-4 mb-5">
                                    {selectedInvoiceInfo.items?.map((item: any) => {
                                        const itemState = selectedItems[item.name]
                                        if (!itemState) return null

                                        return (
                                            <div
                                                key={item.name}
                                                className={`rounded-[14px] p-[18px] border transition-all ${itemState.selected
                                                    ? 'bg-[#F0FDF4] border-[#22C55E]'
                                                    : 'bg-white border-[#D1D5DB]'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Checkbox
                                                        checked={itemState.selected}
                                                        onCheckedChange={() => toggleItemSelection(item.name)}
                                                        className="mt-0.5"
                                                    />
                                                    <div className="flex-1">
                                                        <h5 className="text-base font-semibold text-gray-900">
                                                            {item.item_name || item.item_code}
                                                        </h5>
                                                        <p className="text-[13px] text-[#6B7280]">{item.item_code}</p>
                                                        <p className="text-sm text-[#374151] mt-1">
                                                            ₹{item.rate} × {itemState.maxQty} = {formatCurrency(item.rate * itemState.maxQty)}
                                                        </p>

                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <span className="text-sm text-gray-700 font-medium">Credit Qty:</span>
                                                            <button
                                                                onClick={() => updateItemQty(item.name, -1)}
                                                                disabled={!itemState.selected || itemState.qty <= 1}
                                                                className="w-9 h-9 flex items-center justify-center bg-white border border-[#E5E7EB] rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                <Minus className="h-4 w-4 text-gray-600" />
                                                            </button>
                                                            <span className="min-w-[30px] text-center text-sm font-semibold text-gray-900">
                                                                {itemState.qty}
                                                            </span>
                                                            <button
                                                                onClick={() => updateItemQty(item.name, 1)}
                                                                disabled={!itemState.selected || itemState.qty >= itemState.maxQty}
                                                                className="w-9 h-9 flex items-center justify-center bg-white border border-[#E5E7EB] rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                <Plus className="h-4 w-4 text-gray-600" />
                                                            </button>
                                                            <span className="text-sm text-gray-500">/ {itemState.maxQty}</span>
                                                            <span className="text-sm font-semibold text-gray-900 ml-auto">
                                                                {formatCurrency(item.rate * itemState.qty)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Credit Note Summary */}
                                <div className="bg-[#E0F2FE] border border-[#BAE6FD] rounded-[14px] p-5 mt-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText className="h-5 w-5 text-[#0369A1]" />
                                        <h5 className="text-base font-semibold text-gray-900">Credit Note Summary</h5>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-700">Selected items:</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {getSelectedItemsCount()} of {getTotalItems()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-700">Credit amount:</span>
                                            <span className="text-lg font-bold text-gray-900">
                                                {formatCurrency(getTotalCreditAmount())}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="p-6 border-t border-gray-200 flex gap-3">
                                <button
                                    onClick={() => setSelectedInvoiceInfo(null)}
                                    className="w-[180px] px-3.5 py-3.5 bg-white border border-[#D1D5DB] rounded-[10px] text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleIssueCreditNote}
                                    disabled={!!selectedInvoiceInfo.hasReturn || getSelectedItemsCount() === 0}
                                    className="flex-1 px-3.5 py-3.5 bg-[#10B981] text-white rounded-[10px] text-sm font-medium hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Issue Credit Note
                                </button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        )
    }

    // Invoice list view (unchanged)
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl w-full p-0 gap-0 bg-white h-[80vh] flex flex-col">
                <div className="p-4 bg-white border-b shrink-0">
                    <h2 className="text-lg font-bold">Issue Credit Note</h2>
                    <p className="text-sm text-gray-500">Select a paid invoice to issue credit note</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {invoices.map((inv) => (
                                <div
                                    key={inv.name}
                                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-[#52796F] cursor-pointer transition-all group"
                                    onClick={() => handleSelectInvoice(inv)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-gray-400" />
                                            <span className="font-semibold text-gray-900 text-sm">
                                                {inv.name}
                                            </span>
                                            {inv.is_return === 1 && (
                                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded uppercase">
                                                    Return
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-[#22c55e] text-base">
                                                {formatCurrency(inv.grand_total)}
                                            </span>
                                            <span className="text-[10px] font-bold text-[#22c55e] uppercase tracking-wider">
                                                {inv.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-xs text-gray-500 mb-2">
                                        {inv.posting_date}, {inv.posting_time?.substring(0, 5)}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{inv.customer}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {!loading && invoices.length === 0 && (
                                <div className="text-center py-10 text-gray-400 text-sm">
                                    No paid invoices found
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
