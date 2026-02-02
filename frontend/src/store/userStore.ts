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
            if (userId && userId !== "Guest") {
                const userDetails = await getUserDetails(userId)
                set({ currentUser: userDetails, loading: false })
            } else {
                set({ loading: false, error: "No user logged in" })
            }
        } catch (e: any) {
            console.error("Failed to init user session:", e)
            set({ error: e.message || "Failed to fetch user session", loading: false })
        }
    },

    logout: async () => {
        try {
            await logout()
            set({ currentUser: null })
        } catch (e) {
            console.error("Logout failed:", e)
        }
    },
}))
