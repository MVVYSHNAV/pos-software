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
    const userRole = currentUser?.roles?.[0]?.role || "POS User"

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="focus:outline-none w-11 h-11 rounded-full hover:bg-[#52796F] flex items-center justify-center transition-colors group">
                    <User className="h-6 w-6 text-muted-foreground group-hover:text-white transition-colors" />
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
