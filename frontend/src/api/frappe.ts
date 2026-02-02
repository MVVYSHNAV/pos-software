import { FrappeApp } from "frappe-js-sdk"


// Frappe SDK instance - uses session cookies automatically
export const frappe = new FrappeApp(window.location.origin, {
    useToken: true,
    // @ts-ignore
    type: "token",
    // @ts-ignore
    token: () => window.csrf_token || null
})

export const db = frappe.db()
export const call = frappe.call()


