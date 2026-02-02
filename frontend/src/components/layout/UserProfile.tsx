import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUserStore } from "@/store/userStore"
import { BarChart3, FileText, LogOut, Receipt, User } from "lucide-react"

export function UserProfile() {
    const { currentUser, logout } = useUserStore()

    // Fallback for user name if not loaded or available
    const userName = currentUser?.full_name || currentUser?.name || "Guest User"
    const userRole = "POS User" // This could be dynamic if we had role info, hardcoded for now based on screenshot

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                    <User className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors hover:bg-[#52796F] hover:text-white rounded-full" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {userRole}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>Reports</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Invoices</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                    <Receipt className="mr-2 h-4 w-4" />
                    <span>Issue Credit Note</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
