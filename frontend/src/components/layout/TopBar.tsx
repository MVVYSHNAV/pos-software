import { Input } from "@/components/ui/input"

export function TopBar() {
  return (
    <div className="flex items-center justify-between border-b px-6 py-3">
      <div className="font-semibold text-lg">
        Tridz POS
      </div>

      <div className="w-[420px]">
        <Input placeholder="Search items by name or code..." />
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-green-600">● Online</span>
        <div className="h-8 w-8 rounded-full bg-muted" />
      </div>
    </div>
  )
}
