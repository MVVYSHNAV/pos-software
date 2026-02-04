import { Dialog, DialogContent } from "@/components/ui/dialog"
import { FileText, Loader2 } from "lucide-react"
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
    const [totalInvoices, setTotalInvoices] = useState(0)
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
            setTotalInvoices(data.total)
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
                                    <h2 className="text-xl font-semibold text-gray-900">Invoice Details</h2>
                                    <p className="text-sm text-gray-500 mt-1">View invoice information and items</p>
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
                                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                                {selectedInvoiceInfo.posting_date} {selectedInvoiceInfo.posting_time?.substring(0, 5)}
                                            </p>
                                        </div>
                                        <div className="self-end sm:self-auto flex gap-2">
                                            {selectedInvoiceInfo.is_return === 1 && (
                                                <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-sm sm:text-xs font-semibold rounded-full uppercase bg-red-100 text-red-800">
                                                    Return
                                                </span>
                                            )}
                                            {selectedInvoiceInfo.docstatus === 0 && (
                                                <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-sm sm:text-xs font-semibold rounded-full uppercase bg-yellow-100 text-yellow-700">
                                                    Draft
                                                </span>
                                            )}
                                            {selectedInvoiceInfo.docstatus === 1 && selectedInvoiceInfo.is_return !== 1 && (
                                                <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-sm sm:text-xs font-semibold rounded-full uppercase bg-green-100 text-green-800">
                                                    {selectedInvoiceInfo.status}
                                                </span>
                                            )}
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
                                {/* Items Header */}
                                <div className="flex items-center justify-between mb-3 shrink-0">
                                    <h4 className="text-sm lg:text-base font-semibold text-gray-900">Invoice Items</h4>
                                    <span className="text-sm text-gray-500">
                                        {selectedInvoiceInfo.items?.length || 0} item{selectedInvoiceInfo.items?.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                {/* Items List - Only this scrolls */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 border border-gray-300 p-2 rounded-lg">
                                    {selectedInvoiceInfo.items?.map((item: any, index: number) => (
                                        <div
                                            key={item.name || index}
                                            className="rounded-lg p-2.5 border bg-white border-gray-300 hover:border-black transition-all"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1">
                                                    <h5 className="text-sm lg:text-base font-semibold text-gray-900">
                                                        {item.item_name || item.item_code}
                                                    </h5>
                                                    <p className="text-md text-gray-500">{item.item_code}</p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <p className="text-sm text-gray-700">
                                                            ₹{item.rate} × {Math.abs(item.qty)}
                                                        </p>
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {formatCurrency(item.rate * Math.abs(item.qty))}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Information */}
                            {selectedInvoiceInfo.payments && selectedInvoiceInfo.payments.length > 0 && (
                                <div className="px-4 pb-3 shrink-0">
                                    <div className="bg-[#E6EEE8] border border-[#52796F] rounded-lg p-4">
                                        <h5 className="text-base font-semibold text-gray-900 mb-3">Payment Information</h5>
                                        <div className="space-y-2">
                                            {selectedInvoiceInfo.payments.map((payment: any, index: number) => (
                                                <div key={index} className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-700">{payment.mode_of_payment}:</span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(payment.amount)}
                                                    </span>
                                                </div>
                                            ))}
                                            <div className="border-t border-gray-300 pt-2 mt-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-semibold text-gray-700">Total Paid:</span>
                                                    <span className="text-lg font-bold text-gray-900">
                                                        {formatCurrency(selectedInvoiceInfo.paid_amount || selectedInvoiceInfo.grand_total)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Footer Buttons - Fixed */}
                            <div className="p-4 pt-0 shrink-0 flex gap-3">
                                <button
                                    onClick={() => setSelectedInvoiceInfo(null)}
                                    className="flex-1 px-3.5 py-3.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Back to List
                                </button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl md:max-w-3xl w-full p-0 gap-0 bg-white h-[85vh] max-h-[90vh] rounded-none sm:rounded-2xl flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                <div className="p-4 bg-white shrink-0 border-b border-gray-100">
                    <h2 className="text-lg font-bold">Invoices</h2>
                    <p className="text-sm text-gray-500">View all invoices and their details</p>
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
                                {invoices.map((inv) => {
                                    const statusBadge = getStatusBadge(inv)
                                    return (
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
                                    )
                                })}
                                {!loading && invoices.length === 0 && (
                                    <div className="text-center py-10 text-gray-400 text-sm">
                                        No invoices found
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50 shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages} ({totalInvoices} total)
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${currentPage === pageNum
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'border border-gray-300 bg-white hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        )
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
