import { db } from "./frappe"
import type { Customer } from "@/types/customer"
import { DOCTYPES } from "@/constants/doctypes"

export async function getCustomers() {
  return await db.getDocList<Customer>(DOCTYPES.CUSTOMER, {
    fields: ["name", "customer_name", "mobile_no"],
    limit: 5,
  })
}

export async function createCustomer(data: { customer_name: string; mobile_no?: string }) {
  return await db.createDoc(DOCTYPES.CUSTOMER, {
    customer_group: "All Customer Groups",
    territory: "All Territories",
    ...data,
  })
}
