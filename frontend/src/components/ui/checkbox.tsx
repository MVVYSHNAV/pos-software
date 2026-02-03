import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
    disabled?: boolean
    className?: string
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
    ({ checked = false, onCheckedChange, disabled = false, className }, ref) => {
        return (
            <button
                ref={ref}
                type="button"
                role="checkbox"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onCheckedChange?.(!checked)}
                className={cn(
                    "peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#52796F] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center transition-colors",
                    checked && "bg-[#52796F] text-white border-[#52796F]",
                    !checked && "bg-white",
                    className
                )}
            >
                {checked && <Check className="h-3 w-3" />}
            </button>
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
