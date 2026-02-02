import { db } from "./frappe"
import type { Customer } from "@/types/customer"
import { DOCTYPES } from "@/constants/doctypes"

export async function getCustomers() {
  return await db.getDocList<Customer>(DOCTYPES.CUSTOMER, {
    fields: ["name", "customer_name"],
    limit: 5,
  })
}
