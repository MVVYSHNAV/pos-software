import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, Image, Moon, Sun, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { usePosStore } from "@/store/posStore"

export function SettingsDailog() {
    const { showItemImages, toggleShowItemImages } = usePosStore()
    const [darkMode, setDarkMode] = useState(false)

    // Load dark mode preference on mount
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true'
        setDarkMode(savedDarkMode)
        if (savedDarkMode) {
            document.documentElement.classList.add('dark')
        }
    }, [])

    // Toggle dark mode and persist preference
    const toggleDarkMode = () => {
        const newMode = !darkMode
        setDarkMode(newMode)
        document.documentElement.classList.toggle('dark')
        localStorage.setItem('darkMode', newMode.toString())
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="focus:outline-none w-11 h-11 rounded-full hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors group">
                    <Settings className="h-6 w-6 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-56"
                align="end"
                forceMount
            >
                <DropdownMenuItem
                    className={`cursor-pointer ${showItemImages
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : ''
                        }`}
                    onClick={toggleShowItemImages}
                >
                    {showItemImages && <Check className="mr-2 h-4 w-4" />}
                    <Image className="mr-2 h-4 w-4" />
                    <span>Show Item Images</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    className={`cursor-pointer ${darkMode
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : ''
                        }`}
                    onClick={toggleDarkMode}
                >
                    {darkMode && <Check className="mr-2 h-4 w-4" />}
                    {darkMode ? (
                        <Sun className="mr-2 h-4 w-4" />
                    ) : (
                        <Moon className="mr-2 h-4 w-4" />
                    )}
                    <span>Dark Mode</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
