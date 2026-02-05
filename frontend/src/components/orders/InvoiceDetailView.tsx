import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface InvoiceDetailViewProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    loadingDetails: boolean
    selectedInvoiceInfo: any
    onBack: () => void
    formatCurrency: (amount: number) => string
}

export function InvoiceDetailView({
    open,
    onOpenChange,
    loadingDetails,
    selectedInvoiceInfo,
    onBack,
    formatCurrency
}: InvoiceDetailViewProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl w-[calc(100%-2rem)] h-[90vh] sm:h-[90vh] sm:max-h-[90vh] p-4 sm:p-0 gap-0 bg-card rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col">
                {loadingDetails ? (
                    <div className="flex-1 flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* Header - Fixed */}
                        <div className="px-2 py-4 sm:p-4 shrink-0 flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">Invoice Details</h2>
                                <p className="text-sm text-muted-foreground mt-1">View invoice information and items</p>
                            </div>
                        </div>

                        {/* Invoice Information Card - Fixed */}
                        <div className="px-2 pb-2 sm:px-4 sm:pb-3 shrink-0">
                            <div className="bg-muted/30 border border-border rounded-xl p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2 sm:gap-0">
                                    <div>
                                        <h3 className="text-sm sm:text-base font-semibold text-foreground">{selectedInvoiceInfo.name}</h3>
                                        <p className="text-xs sm:text-sm font-medium text-foreground mt-1">{selectedInvoiceInfo.customer}</p>
                                        <p className="text-xs sm:text-sm text-muted-foreground">{selectedInvoiceInfo.contact_mobile || selectedInvoiceInfo.mobile_no}</p>
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
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

                                <div className="border-t border-border pt-3 mt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm sm:text-base font-medium text-muted-foreground">Invoice Total:</span>
                                        <span className="text-base sm:text-lg font-semibold text-foreground">{formatCurrency(selectedInvoiceInfo.grand_total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Items Section */}
                        <div className="flex-1 px-2 py-3 sm:px-4 flex flex-col overflow-hidden">
                            {/* Items Header */}
                            <div className="flex items-center justify-between mb-3 shrink-0">
                                <h4 className="text-sm lg:text-base font-semibold text-foreground">Invoice Items</h4>
                                <span className="text-sm text-muted-foreground">
                                    {selectedInvoiceInfo.items?.length || 0} item{selectedInvoiceInfo.items?.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {/* Items List - Only this scrolls */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 border border-border p-2 rounded-lg">
                                {selectedInvoiceInfo.items?.map((item: any, index: number) => (
                                    <div
                                        key={item.name || index}
                                        className="rounded-lg p-2.5 border bg-card border-border hover:border-foreground transition-all"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                                <h5 className="text-sm lg:text-base font-semibold text-foreground">
                                                    {item.item_name || item.item_code}
                                                </h5>
                                                <p className="text-md text-muted-foreground">{item.item_code}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        ₹{item.rate} × {Math.abs(item.qty)}
                                                    </p>
                                                    <span className="text-sm font-semibold text-foreground">
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
                            <div className="px-2 pb-3 sm:px-4 shrink-0">
                                <div className="bg-primary/10 border border-primary rounded-lg p-4">
                                    <h5 className="text-base font-semibold text-foreground mb-3">Payment Information</h5>
                                    <div className="space-y-2">
                                        {selectedInvoiceInfo.payments.map((payment: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">{payment.mode_of_payment}:</span>
                                                <span className="text-sm font-medium text-foreground">
                                                    {formatCurrency(payment.amount)}
                                                </span>
                                            </div>
                                        ))}
                                        <div className="border-t border-border pt-2 mt-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-semibold text-muted-foreground">Total Paid:</span>
                                                <span className="text-lg font-bold text-foreground">
                                                    {formatCurrency(selectedInvoiceInfo.paid_amount || selectedInvoiceInfo.grand_total)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer Buttons - Fixed */}
                        <div className="px-2 pt-0 pb-2 sm:p-4 sm:pt-0 shrink-0 flex gap-3">
                            <button
                                onClick={onBack}
                                className="flex-1 px-3.5 py-3.5 bg-card border border-input rounded-xl text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
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
