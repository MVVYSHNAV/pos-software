import { Dialog, DialogContent } from "@/components/ui/dialog"
import { FileText, Loader2 } from "lucide-react"
import { InvoiceDetailView } from "./InvoiceDetailView"
import { useEffect, useState } from "react"
import { getAllInvoices, getInvoice } from "@/api/invoice"
import { formatCurrency } from "@/lib/utils"

interface InvoicesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function InvoicesDialog({ open, onOpenChange }: InvoicesDialogProps) {
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedInvoiceInfo, setSelectedInvoiceInfo] = useState<any>(null)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const pageSize = 20

    useEffect(() => {
        if (open) {
            setCurrentPage(1)
            loadInvoices(1)
            setSelectedInvoiceInfo(null)
        }
    }, [open])

    const loadInvoices = async (page: number) => {
        setLoading(true)
        try {
            const data = await getAllInvoices(page, pageSize)
            setInvoices(data.invoices)
            setTotalPages(data.totalPages)
            setCurrentPage(data.currentPage)
        } catch (error) {
            console.error("Failed to load invoices", error)
        } finally {
            setLoading(false)
        }
    }

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            loadInvoices(newPage)
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

    // Helper function to get status badge styling
    const getStatusBadge = (inv: any) => {
        if (inv.is_return === 1) {
            return {
                text: 'Return',
                className: 'bg-red-100 text-red-600'
            }
        }
        if (inv.docstatus === 0) {
            return {
                text: 'Draft',
                className: 'bg-yellow-100 text-yellow-700'
            }
        }
        return {
            text: inv.status,
            className: 'bg-green-100 text-green-700'
        }
    }

    // Detail view with redesigned UI (same as credit note)
    if (selectedInvoiceInfo || loadingDetails) {
        return (
            <InvoiceDetailView
                open={open}
                onOpenChange={onOpenChange}
                loadingDetails={loadingDetails}
                selectedInvoiceInfo={selectedInvoiceInfo}
                onBack={() => setSelectedInvoiceInfo(null)}
                formatCurrency={formatCurrency}
            />
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl md:max-w-3xl w-[calc(100%-2rem)] p-4 sm:p-0 gap-0 bg-card h-[85vh] max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                <div className="px-2 py-4 sm:p-4 bg-card shrink-0 border-b border-border">
                    <h2 className="text-lg font-bold">Invoices</h2>
                    <p className="text-sm text-muted-foreground">View all invoices and their details</p>
                </div>

                {/* Content Container - Fixed frame with internal scroll */}
                <div className="flex-1 min-h-0 overflow-hidden p-2">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="h-full border border-border rounded-lg overflow-hidden flex flex-col">
                            {/* Inner Scrollable List */}
                            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-2 space-y-3">
                                {invoices.map((inv) => {
                                    const statusBadge = getStatusBadge(inv)
                                    return (
                                        <div
                                            key={inv.name}
                                            className="bg-card p-3 rounded-lg border border-border hover:border-foreground cursor-pointer transition-all"
                                            onClick={() => handleSelectInvoice(inv)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-semibold text-foreground text-md">
                                                        {inv.name}
                                                    </span>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-1">
                                                    <span className="block font-bold text-emerald-500 text-base">
                                                        {formatCurrency(inv.grand_total)}
                                                    </span>
                                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase ${statusBadge.className}`}>
                                                        {statusBadge.text}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-sm text-muted-foreground">
                                                {inv.posting_date}, {inv.posting_time?.substring(0, 5)}
                                            </div>

                                            <div>
                                                <p className="text-lg font-medium text-foreground">{inv.customer}</p>
                                                {inv.contact_mobile && (
                                                    <p className="text-sm text-muted-foreground">{inv.contact_mobile}</p>
                                                )}
                                            </div>

                                            {inv.total_qty && (
                                                <div className="mt-2 text-left">
                                                    <p className="text-sm text-muted-foreground font-medium inline-block px-2 py-1 rounded">
                                                        {Math.floor(inv.total_qty)} item{Math.floor(inv.total_qty) !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                                {!loading && invoices.length === 0 && (
                                    <div className="text-center py-10 text-muted-foreground text-sm">
                                        No invoices found
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="p-4 border-t border-border bg-muted/30 shrink-0">
                        <div className="flex items-center justify-center">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-input bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>

                                {/* Page numbers */}
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum: number
                                        if (totalPages <= 5) {
                                            pageNum = i + 1
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i
                                        } else {
                                            pageNum = currentPage - 2 + i
                                        }

                                        return (
                                            <div
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${currentPage === pageNum
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'border border-input bg-card hover:bg-muted'
                                                    }`}
                                            >
                                                {pageNum}
                                            </div>
                                        )
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-input bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
