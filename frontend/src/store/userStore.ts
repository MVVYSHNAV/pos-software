import { create } from "zustand"
import { getLoggedUser, getUserDetails, logout, type UserDetails } from "@/api/user"

interface UserState {
    currentUser: UserDetails | null
    loading: boolean
    error: string | null

    initSession: () => Promise<void>
    logout: () => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
    currentUser: null,
    loading: false,
    error: null,

    initSession: async () => {
        try {
            set({ loading: true, error: null })
            const userId = await getLoggedUser()

            // Check for valid user and ensure it's not the guest user
            if (!userId || userId === "Guest") {
                // Redirect to Frappe login page
                window.location.href = "/login"
                return
            }

            const userDetails = await getUserDetails(userId)
            set({ currentUser: userDetails, loading: false })
        } catch (e: any) {
            console.error("Failed to init user session:", e)
            // If authentication fails, redirect to login
            window.location.href = "/login"
        }
    },

    logout: async () => {
        // Clear local state first
        set({ currentUser: null, loading: false, error: null })
        // Call logout API which will redirect to login page
        await logout()
    },
}))
