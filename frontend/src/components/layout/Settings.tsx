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
                <button className="focus:outline-none w-11 h-11 rounded-full hover:bg-[#52796F] hover:text-white flex items-center justify-center transition-colors group">
                    <Settings className="h-6 w-6 text-muted-foreground group-hover:text-white transition-colors" />
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
