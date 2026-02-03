import { db } from "./frappe"
import { DOCTYPES } from "@/constants/doctypes"
import type { POSProfile } from "@/types/pos"

/**
 * Get POS Profile assigned to current user
 */
export async function getPOSProfile(): Promise<POSProfile> {
  const profiles = await db.getDocList<POSProfile>(DOCTYPES.POS_PROFILE, {
    fields: ["name"],
  })

  if (!profiles.length) {
    throw new Error("No POS Profile found for user")
  }

  for (const profile of profiles) {
    const entry = await getOpeningEntry(profile.name)
    if (entry) {
      return await db.getDoc(DOCTYPES.POS_PROFILE, profile.name)
    }
  }

  return await db.getDoc(DOCTYPES.POS_PROFILE, profiles[0].name)
}

/**
 * Get open POS Opening Entry
 */
export async function getOpeningEntry(posProfile: string) {
  const entries = await db.getDocList(DOCTYPES.POS_OPENING_ENTRY, {
    filters: [
      ["pos_profile", "=", posProfile],
      ["status", "=", "Open"],
    ],
    limit: 1,
  })

  return entries.length ? entries[0] : null
}
