import { create } from "zustand"
import type { POSProfile } from "@/types/pos"
import { getPOSProfile, getOpeningEntry } from "@/api/pos"

interface PosState {
  profile: POSProfile | null
  openingEntry: any | null
  loading: boolean
  error: string | null

  boot: () => Promise<void>
}

export const usePosStore = create<PosState>((set) => ({
  profile: null,
  openingEntry: null,
  loading: false,
  error: null,

  boot: async () => {
    try {
      set({ loading: true })

      const profile = await getPOSProfile()
      const opening = await getOpeningEntry(profile.name)

      if (!opening) {
        throw new Error("POS Opening Entry not found")
      }

      set({
        profile,
        openingEntry: opening,
        loading: false,
      })
    } catch (e: any) {
      set({
        error: e.message,
        loading: false,
      })
    }
  },
}))
