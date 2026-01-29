import { db } from "./frappe"
import type { Customer } from "@/types/customer"

export async function getCustomers() {
  return await db.getDocList<Customer>("Customer", {
    fields: ["name", "customer_name"],
    limit: 20,
  })
}
