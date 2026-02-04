import { AlertTriangle, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NoPosProfileError({ error }: { error: string }) {
    const handleRedirect = () => {
        // Redirect to Desk
        window.location.href = "/app"
    }

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-muted/50 p-6 text-center">
            <div className="max-w-md w-full bg-card rounded-2xl shadow-xl shadow-muted/50 p-8 border border-border animate-in fade-in zoom-in duration-300">
                <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-2">
                    No POS Profile Found
                </h1>

                <p className="text-muted-foreground mb-8 leading-relaxed">
                    {error || "Your user account is not assigned to any POS Profile. Please contact your administrator or configure a POS Profile in Desk."}
                </p>

                <div className="space-y-3">
                    <Button
                        onClick={handleRedirect}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl gap-2 transition-all"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Go to Desk
                    </Button>
                </div>

                <p className="mt-8 text-xs text-muted-foreground">
                    You need a POS Profile to access the Point of Sale.
                </p>
            </div>
        </div>
    )
}
