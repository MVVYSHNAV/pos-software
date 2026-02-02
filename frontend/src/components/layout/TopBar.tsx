import { Input } from "@/components/ui/input"
import { ScanLine } from "lucide-react"
import { useItemsStore } from "@/store/itemsStore"
import { Settings } from "lucide-react"
import { UserProfile } from "./UserProfile"

export function TopBar() {
  const { searchTerm, setSearchTerm } = useItemsStore()

  return (
    <div className="flex items-center justify-between border-b px-4 py-2 bg-background h-[60px]">
      <div className="flex items-center gap-2">
        <div className="bg-[#52796F] rounded p-1">
          <span className="font-bold text-white text-xs px-1">TP</span>
        </div>
        <span className="font-semibold text-lg text-[#52796F]">Tridz POS</span>
      </div>

      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Input
            placeholder="Search items by name or code..."
            className="w-full pr-10 h-10 border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <ScanLine className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          <span className="text-sm text-muted-foreground">Online</span>
        </div>
        <Settings className="h-5 w-5 text-muted-foreground cursor-pointer" />
        <UserProfile />
      </div>
    </div>
  )
}
