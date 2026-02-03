import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Loader2, ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { getPaidInvoices, getInvoice } from "@/api/invoice"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cartStore"
import { useToast } from "@/hooks/use-toast"

interface CreditNoteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreditNoteDialog({ open, onOpenChange }: CreditNoteDialogProps) {
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedInvoiceInfo, setSelectedInvoiceInfo] = useState<any>(null)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const { loadOrder } = useCartStore()
    const { toast } = useToast()

    useEffect(() => {
        if (open) {
            loadInvoices()
            setSelectedInvoiceInfo(null)
        }
    }, [open])

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
            setSelectedInvoiceInfo(data)
        } catch (error) {
            console.error("Failed to load invoice details", error)
        } finally {
            setLoadingDetails(false)
        }
    }

    const handleReturn = async () => {
        if (!selectedInvoiceInfo) return

        // Transform items to cart format with NEGATIVE quantities for return
        const cartItems = selectedInvoiceInfo.items.map((item: any) => ({
            item_code: item.item_code,
            item_name: item.item_name || item.item_code,
            qty: -1 * Math.abs(item.qty), // Ensure negative
            rate: item.rate
        }))

        const customerData = {
            name: selectedInvoiceInfo.customer,
            customer_name: selectedInvoiceInfo.customer_name || selectedInvoiceInfo.customer,
            mobile_no: selectedInvoiceInfo.contact_mobile || selectedInvoiceInfo.mobile_no
        }

        // Load order with return_against set to original invoice name
        loadOrder(cartItems, customerData, selectedInvoiceInfo.name)

        toast({ description: "Return initialized. Please verify items to return." })
        onOpenChange(false)
    }

    if (selectedInvoiceInfo || loadingDetails) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-xl w-full p-0 gap-0 bg-white h-[80vh] flex flex-col">
                    {loadingDetails ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-[#52796F]" />
                        </div>
                    ) : (
                        <>
                            <DialogHeader className="p-4 bg-white border-b shrink-0 flex flex-row items-center gap-2 space-y-0">
                                <Button variant="ghost" size="icon" onClick={() => setSelectedInvoiceInfo(null)} className="h-8 w-8 -ml-2">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <DialogTitle className="text-lg font-bold">{selectedInvoiceInfo.name}</DialogTitle>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50">
                                <div className="bg-white rounded-lg border p-4 mb-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{selectedInvoiceInfo.customer}</h3>
                                            <p className="text-sm text-gray-500">{selectedInvoiceInfo.pos_profile}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-2xl text-[#52796F]">
                                                {formatCurrency(selectedInvoiceInfo.grand_total)}
                                            </span>
                                            <span className="text-xs uppercase font-bold text-gray-400">Grand Total</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 border-t pt-4">
                                        {selectedInvoiceInfo.items?.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span>{item.item_name || item.item_code} <span className="text-gray-400">x{item.qty}</span></span>
                                                <span className="font-medium">{formatCurrency(item.qty * item.rate)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t bg-white">
                                <Button className="w-full gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200" onClick={handleReturn}>
                                    <ArrowLeft className="h-4 w-4" />
                                    Return / Credit Note
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl w-full p-0 gap-0 bg-white h-[80vh] flex flex-col">
                <DialogHeader className="p-4 bg-white border-b shrink-0">
                    <DialogTitle className="text-lg font-bold">Issue Credit Note</DialogTitle>
                    <p className="text-sm text-gray-500">Select a paid invoice to issue credit note</p>
                </DialogHeader>

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
