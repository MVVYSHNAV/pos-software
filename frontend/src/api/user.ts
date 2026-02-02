import { call, db } from "./frappe"

export interface UserDetails {
    name: string
    email: string
    full_name: string
    user_image?: string
    roles?: string[]
}

export async function getLoggedUser(): Promise<string> {
    const result = await call.get("frappe.auth.get_logged_user")
    return result
}

export async function getUserDetails(userId: string): Promise<UserDetails> {
    // If userId is not provided or invalid, return basic info or throw
    if (!userId) throw new Error("User ID is required")

    const user = await db.getDoc<UserDetails>("User", userId)
    return user
}

export async function logout(): Promise<void> {
    await call.post("logout")
    window.location.reload()
}
