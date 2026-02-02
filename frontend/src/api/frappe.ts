import { FrappeApp } from "frappe-js-sdk"

const frappe = new FrappeApp(import.meta.env.VITE_FRAPPE_BASE_URL);


// IMPORTANT: these are OBJECTS, not functions
export const db = frappe.db()
export const call = frappe.call()
export const auth = frappe.auth()
