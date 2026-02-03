import { Input } from "@/components/ui/input"
import { useItemsStore } from "@/store/itemsStore"
import { Settings, ScanLine } from "lucide-react"
import { UserProfile } from "./UserProfile"

export function TopBar() {
  const { searchTerm, setSearchTerm } = useItemsStore()

  return (
    <div className="flex items-center justify-between px-5 pt-2 pb-2 bg-white md:bg-background h-auto md:h-16 gap-3 md:gap-2 rounded-t-[2rem] md:rounded-none mt-2 md:mt-0 shadow-sm md:shadow-none border-b md:border-b-2">
      <div className="flex items-center gap-2 shrink-0">
        <div className="bg-[#52796F] rounded-xl md:rounded-lg p-2.5 aspect-square flex items-center justify-center shadow-sm">
          <span className="font-bold text-white text-sm tracking-tighter">ERP</span>
        </div>
      </div>

      <div className="flex-1 max-w-2xl px-1">
        <div className="relative">
          <Input
            placeholder="Search items by name"
            className="w-full pr-10 h-[3.25rem] md:h-10 border-[#52796F] border-[1.5px] rounded-2xl md:rounded-xl text-base md:text-sm text-gray-700 bg-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:border-[#52796F] pl-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ScanLine className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400/80" strokeWidth={2.5} />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-5 shrink-0 pl-1">
        <Settings className="h-6 w-6 text-gray-600 cursor-pointer stroke-[1.5px]" />
        <UserProfile />
      </div>
    </div>
  )
}
