import { db } from "./frappe"
import type { POSProfile } from "@/types/pos"

/**
 * Get POS Profile assigned to user
 */
export async function getPOSProfile(): Promise<POSProfile> {
  const profiles = await db.getDocList<POSProfile>("POS Profile", {
    fields: [
      "name",
      "company",
      "currency",
      "selling_price_list",
    ],
    limit: 1,
  })

  if (!profiles.length) {
    throw new Error("No POS Profile found")
  }

  return await db.getDoc("POS Profile", profiles[0].name)
}

/**
 * Check if POS Opening Entry exists for today
 */
export async function getOpeningEntry(posProfile: string) {
  const entries = await db.getDocList("POS Opening Entry", {
    filters: [
      ["pos_profile", "=", posProfile],
      ["status", "=", "Open"],
    ],
    limit: 1,
  })

  return entries.length ? entries[0] : null
}
