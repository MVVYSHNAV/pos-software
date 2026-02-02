import { AlertCircle, ArrowRight, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"

export function OpeningEntryError({ error }: { error: string }) {
    const handleRedirect = () => {
        // Usually Frappe POS Opening Entry is at /app/pos-opening-entry
        window.location.href = "/app/pos-opening-entry/new"
    }

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50/50 p-6 text-center">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100 animate-in fade-in zoom-in duration-300">
                <div className="h-16 w-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="h-8 w-8 text-orange-500" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Opening Entry Required
                </h1>

                <p className="text-gray-500 mb-8 leading-relaxed">
                    {error || "We couldn't find an active POS Opening Entry for your session. You need to create one to start selling."}
                </p>

                <div className="space-y-3">
                    <Button
                        onClick={handleRedirect}
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl gap-2 transition-all"
                    >
                        Create Opening Entry
                        <ArrowRight className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => window.location.href = "/app"}
                        className="w-full h-12 border-gray-200 text-gray-600 font-medium rounded-xl gap-2 hover:bg-gray-50 transition-all"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Go to Dashboard
                    </Button>
                </div>

                <p className="mt-8 text-xs text-gray-400">
                    If you believe this is an error, please contact your administrator.
                </p>
            </div>
        </div>
    )
}
