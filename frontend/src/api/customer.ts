import { db } from "./frappe"
import type { Customer } from "@/types/customer"
import { DOCTYPES } from "@/constants/doctypes"

export async function getCustomers(query?: string) {
  const filters: any[] = []

  if (query) {
    if (/^\d+$/.test(query)) {
      filters.push(["mobile_no", "like", `%${query}%`])
    } else {
      filters.push(["customer_name", "like", `%${query}%`])
    }
  }

  return await db.getDocList<Customer>(DOCTYPES.CUSTOMER, {
    fields: ["name", "customer_name", "mobile_no"],
    filters,
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

export async function getCustomerByMobile(mobile: string) {
  const docs = await db.getDocList<Customer>(DOCTYPES.CUSTOMER, {
    fields: ["name", "customer_name", "mobile_no"],
    filters: [["mobile_no", "=", mobile]],
    limit: 1,
  })
  return docs[0]
}
