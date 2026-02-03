import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { getPaidInvoices } from "@/api/invoice"
// import { formatCurrency } from "@/lib/utils" // Assuming this exists or I'll do inline

interface CreditNoteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreditNoteDialog({ open, onOpenChange }: CreditNoteDialogProps) {
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            loadInvoices()
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl w-full p-0 gap-0 bg-white">
                <DialogHeader className="p-4 bg-white border-b">
                    <DialogTitle className="text-lg font-bold">Issue Credit Note</DialogTitle>
                    <p className="text-sm text-gray-500">Select a paid invoice to issue credit note</p>
                </DialogHeader>

                <div className="h-[60vh] overflow-y-auto p-4 custom-scrollbar">
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
                                    onClick={() => {
                                        // Handle selection - for now just log or basic logic
                                        console.log("Selected", inv.name)
                                    }}
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
                                                ₹{inv.grand_total?.toFixed(2)}
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
                                            {/* Placeholder logic for items count if available in list view or separate fetch */}
                                            {/* <p className="text-xs text-gray-400 mt-0.5">2 item(s)</p> */}
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
