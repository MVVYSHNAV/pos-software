import { FrappeApp } from "frappe-js-sdk"


// Frappe SDK instance - uses session cookies automatically
export const frappe = new FrappeApp(window.location.origin)

export const db = frappe.db()
export const call = frappe.call()


