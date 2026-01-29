import { FrappeApp } from "frappe-js-sdk"

export const frappe = new FrappeApp(window.location.origin)

export const db = frappe.db()
export const call = frappe.call()
