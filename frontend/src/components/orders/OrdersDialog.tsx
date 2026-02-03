import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { getDraftInvoices, getPaidInvoices } from "@/api/invoice"
import { cn } from "@/lib/utils"

interface OrdersDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect?: (invoice: any) => void
}

export function OrdersDialog({ open, onOpenChange, onSelect }: OrdersDialogProps) {
    const [activeTab, setActiveTab] = useState("drafts")
    const [drafts, setDrafts] = useState<any[]>([])
    const [recent, setRecent] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            loadData()
        }
    }, [open, activeTab])

    const loadData = async () => {
        setLoading(true)
        try {
            if (activeTab === "drafts") {
                const data = await getDraftInvoices()
                setDrafts(data)
            } else {
                const data = await getPaidInvoices()
                setRecent(data)
            }
        } catch (error) {
            console.error("Failed to load invoices", error)
        } finally {
            setLoading(false)
        }
    }

    const InvoiceList = ({ invoices, type }: { invoices: any[], type: "draft" | "recent" }) => (
        <div className="space-y-3">
            {invoices.map((inv) => (
                <div
                    key={inv.name}
                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-[#52796F] cursor-pointer transition-all group"
                    onClick={() => {
                        onSelect?.(inv)
                        console.log("Selected", type, inv.name)
                        // TODO: Resume logic for drafts
                        onOpenChange(false)
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
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider",
                                type === "draft" ? "text-orange-500" : "text-blue-600"
                            )}>
                                {type === "draft" ? "Draft" : inv.status}
                            </span>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 mb-2">
                        {type === "draft" ? "Modified: " : "Paid: "}
                        {inv.posting_date}, {inv.posting_time?.substring(0, 5)}
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-800">{inv.customer}</p>
                        </div>
                    </div>
                </div>
            ))
            }
            {
                !loading && invoices.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        No {type} invoices found
                    </div>
                )
            }
        </div >
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl w-full p-0 gap-0 bg-white h-[80vh] flex flex-col">
                <DialogHeader className="p-4 bg-white border-b shrink-0">
                    <DialogTitle className="text-lg font-bold">Invoices</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="drafts" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-4 pt-2 shrink-0">
                        <TabsList className="grid w-full grid-cols-2 bg-muted/20">
                            <TabsTrigger value="drafts" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                Drafts
                            </TabsTrigger>
                            <TabsTrigger value="recent" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                Recent Orders
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            </div>
                        ) : (
                            <>
                                <TabsContent value="drafts" className="mt-0 space-y-4">
                                    <InvoiceList invoices={drafts} type="draft" />
                                </TabsContent>
                                <TabsContent value="recent" className="mt-0 space-y-4">
                                    <InvoiceList invoices={recent} type="recent" />
                                </TabsContent>
                            </>
                        )}
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
