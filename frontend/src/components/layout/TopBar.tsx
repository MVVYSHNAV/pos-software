import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScanLine, UserRound } from "lucide-react"
import { useItemsStore } from "@/store/itemsStore"

export function TopBar() {
  const { searchTerm, setSearchTerm } = useItemsStore()


  return (
    <div className="flex items-center justify-between border-b px-4 sm:px-6 py-3 bg-card">
      <div className="font-semibold text-base sm:text-lg flex items-center gap-2">
        <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          T
        </div>
        <span className="hidden sm:inline">Tridz POS</span>
      </div>

      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Input
            placeholder="Search items by name or code..."
            className="w-full pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"

          >
            <ScanLine className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <span className="text-xs sm:text-sm text-green-600 flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-600"></span>
          <span className="hidden sm:inline">Online</span>
        </span>
        <UserRound className="h-8 w-8 rounded-full bg-white border-2" />
      </div>
    </div>
  )
}
