import { db, frappe } from "./frappe"

export interface UserDetails {
    name: string
    email: string
    full_name: string
    user_image?: string
    roles?: { role: string }[]
}

export async function getLoggedUser(): Promise<string> {
    const result = await frappe.auth().getLoggedInUser()
    return result
}

export async function getUserDetails(userId: string): Promise<UserDetails> {
    // If userId is not provided or invalid, return basic info or throw
    if (!userId) throw new Error("User ID is required")

    const user = await db.getDoc<UserDetails>("User", userId)
    return user
}

export async function logout(): Promise<void> {
    window.location.href = "/login"
}
