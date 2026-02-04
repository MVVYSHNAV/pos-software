import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, Image, Moon, Check } from "lucide-react"
import { useState } from "react"
import { usePosStore } from "@/store/posStore"

export function SettingsDailog() {
    const { showItemImages, toggleShowItemImages } = usePosStore()
    const [darkMode, setDarkMode] = useState(false)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                    <Settings className="h-6 w-6 text-gray-600 cursor-pointer stroke-[1.5px] hover:text-[#52796F] transition-colors" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-56"
                align="end"
                forceMount
            >
                <DropdownMenuItem
                    className={`cursor-pointer ${showItemImages
                        ? 'bg-[#52796F] text-white hover:bg-[#52796F]/90'
                        : ''
                        }`}
                    onClick={toggleShowItemImages}
                >
                    {showItemImages && <Check className="mr-2 h-4 w-4" />}
                    <Image className="mr-2 h-4 w-4" />
                    <span>Show Item Images</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => setDarkMode(!darkMode)}
                >
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark Mode</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
