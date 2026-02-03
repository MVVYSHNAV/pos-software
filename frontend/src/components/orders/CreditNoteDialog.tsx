import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CreditCard, FileText, Loader2, Minus, Plus } from "lucide-react"
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
                <DialogContent className="max-w-3xl w-full h-[100dvh] sm:h-[90vh] sm:max-h-[90vh] p-0 gap-0 bg-white rounded-none sm:rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col">
                    {loadingDetails ? (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
                        </div>
                    ) : (
                        <>
                            {/* Header - Fixed */}
                            <div className="p-4 shrink-0 flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Issue Credit Note</h2>
                                    <p className="text-sm text-gray-500 mt-1">Select items and quantities for credit note</p>
                                </div>
                            </div>

                            {/* Invoice Information Card - Fixed */}
                            <div className="px-3 pb-2 sm:px-4 sm:pb-3 shrink-0">
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2 sm:gap-0">
                                        <div>
                                            <h3 className="text-sm sm:text-base font-semibold text-gray-900">{selectedInvoiceInfo.name}</h3>
                                            <p className="text-xs sm:text-sm font-medium text-gray-900 mt-1">{selectedInvoiceInfo.customer}</p>
                                            <p className="text-xs sm:text-sm text-gray-500">{selectedInvoiceInfo.contact_mobile || selectedInvoiceInfo.mobile_no}</p>
                                        </div>
                                        <div className="self-end sm:self-auto">
                                            <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-green-100 text-green-800 text-[10px] sm:text-xs font-semibold rounded-full uppercase">
                                                {selectedInvoiceInfo.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-3 mt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm sm:text-base font-medium text-gray-700">Invoice Total:</span>
                                            <span className="text-base sm:text-lg font-semibold text-gray-900">{formatCurrency(selectedInvoiceInfo.grand_total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* Scrollable Items Section */}
                            <div className="flex-1 px-4 py-3 flex flex-col overflow-hidden">
                                {/* Select Items Section Header */}
                                <div className="flex items-center justify-between mb-3 shrink-0">
                                    <h4 className="text-sm lg:text-base font-semibold text-gray-900">Select Items for Credit Note</h4>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={selectAll}
                                            className="px-3.5 py-2 border border-gray-300 rounded-lg text-xs lg:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Select All
                                        </button>
                                        <button
                                            onClick={clearAll}
                                            className="px-3.5 py-2 border border-gray-300 rounded-lg text-xs lg:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                {/* Items List - Only this scrolls */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 border border-gray-300 p-2 rounded-lg">
                                    {selectedInvoiceInfo.items?.map((item: any) => {
                                        const itemState = selectedItems[item.name]
                                        if (!itemState) return null

                                        return (
                                            <div
                                                key={item.name}
                                                className={`rounded-lg p-2.5 border transition-all ${itemState.selected
                                                    ? 'bg-[#E6EEE8] border-[#52796F] hover:border-black'
                                                    : 'bg-white border-gray-300 hover:border-black'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Checkbox
                                                        checked={itemState.selected}
                                                        onCheckedChange={() => toggleItemSelection(item.name)}
                                                        className="mt-0.5"
                                                    />
                                                    <div className="flex-1">
                                                        <h5 className="text-sm lg:text-base font-semibold text-gray-900">
                                                            {item.item_name || item.item_code}
                                                        </h5>
                                                        <p className="text-[13px] text-gray-500">{item.item_code}</p>
                                                        <p className="text-sm text-gray-700 mt-1">
                                                            ₹{item.rate} × {itemState.maxQty} = {formatCurrency(item.rate * itemState.maxQty)}
                                                        </p>

                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <span className="text-xs lg:text-sm text-gray-700 font-medium">Credit Qty:</span>
                                                            <button
                                                                onClick={() => updateItemQty(item.name, -1)}
                                                                disabled={!itemState.selected || itemState.qty <= 1}
                                                                className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                <Minus className="h-4 w-4 text-gray-600" />
                                                            </button>
                                                            <span className="min-w-8 text-center text-xs lg:text-sm font-semibold text-gray-900">
                                                                {itemState.qty}
                                                            </span>
                                                            <button
                                                                onClick={() => updateItemQty(item.name, 1)}
                                                                disabled={!itemState.selected || itemState.qty >= itemState.maxQty}
                                                                className="lg:w-9 lg:h-9 w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                <Plus className="h-4 w-4 text-gray-600" />
                                                            </button>
                                                            <span className="text-xs lg:text-sm text-gray-500">/ {itemState.maxQty}</span>
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
                            </div>

                            {/* Credit Note Summary - Fixed */}
                            <div className="px-4 pb-3 shrink-0">
                                <div className="bg-[#E6EEE8] border border-[#52796F] rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CreditCard className="h-5 w-5 text-gray-600" />
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

                            {/* Footer Buttons - Fixed */}
                            <div className="p-4 pt-0 shrink-0 flex gap-3">
                                <button
                                    onClick={() => setSelectedInvoiceInfo(null)}
                                    className="flex-1 px-3.5 py-3.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleIssueCreditNote}
                                    disabled={!!selectedInvoiceInfo.hasReturn || getSelectedItemsCount() === 0}
                                    className="flex-1 px-3.5 py-3.5 bg-[#52796F] text-white rounded-xl text-sm font-medium hover:bg-[#52796F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Issue Credit Note
                                </button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog >
        )
    }


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl md:max-w-3xl w-full p-0 gap-0 bg-white h-[85vh] max-h-[90vh] rounded-none sm:rounded-2xl flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                <div className="p-4 bg-white shrink-0 border-b border-gray-100">
                    <h2 className="text-lg font-bold">Issue Credit Note</h2>
                    <p className="text-sm text-gray-500">Select a paid invoice to issue credit note</p>
                </div>

                {/* Content Container - Fixed frame with internal scroll */}
                <div className="flex-1 min-h-0 overflow-hidden p-2">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <div className="h-full border border-gray-300 rounded-lg overflow-hidden flex flex-col">
                            {/* Inner Scrollable List */}
                            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-2 space-y-3">
                                {invoices.map((inv) => (
                                    <div
                                        key={inv.name}
                                        className="bg-white p-3 rounded-lg border border-gray-200 hover:border-black cursor-pointer transition-all"
                                        onClick={() => handleSelectInvoice(inv)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-gray-400" />
                                                <span className="font-semibold text-gray-900 text-md">
                                                    {inv.name}
                                                </span>
                                                {inv.is_return === 1 && (
                                                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded uppercase">
                                                        Return
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-1">

                                                <span className="block font-bold text-emerald-500 text-base">
                                                    {formatCurrency(inv.grand_total)}
                                                </span>
                                                <span className="text-sm font-bold text-emerald-500 uppercase tracking-wider px-1.5 py-0.5 rounded w-fit">
                                                    {inv.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-500">
                                            {inv.posting_date}, {inv.posting_time?.substring(0, 5)}
                                        </div>

                                        <div>
                                            <p className="text-lg font-medium text-gray-800">{inv.customer}</p>
                                            {inv.contact_mobile && (
                                                <p className="text-sm text-gray-500">{inv.contact_mobile}</p>
                                            )}
                                        </div>

                                        {inv.total_qty && (
                                            <div className="mt-2 text-left">
                                                <p className="text-sm text-gray-500 font-medium inline-block px-2 py-1 rounded">
                                                    {Math.floor(inv.total_qty)} item{Math.floor(inv.total_qty) !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {!loading && invoices.length === 0 && (
                                    <div className="text-center py-10 text-gray-400 text-sm">
                                        No paid invoices found
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
