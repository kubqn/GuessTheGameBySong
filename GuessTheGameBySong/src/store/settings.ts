import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { readStored, StorageKey, writeStored } from '../storage'

export interface SettingsState {
  strikePlayedGames: boolean
  franchiseHint: boolean
  showMissedGuesses: boolean
  showRoundCount: boolean
}

const defaultSettings: SettingsState = {
  strikePlayedGames: false,
  franchiseHint: false,
  showMissedGuesses: false,
  showRoundCount: false,
}

const loadSettings = (): SettingsState => {
  const raw = readStored(StorageKey.Settings)
  if (!raw) {
    return defaultSettings
  }
  try {
    const stored = JSON.parse(raw) as Partial<SettingsState>
    //storage can hold anything, so only known keys with a boolean survive
    const merged = { ...defaultSettings }
    for (const key of Object.keys(defaultSettings) as (keyof SettingsState)[]) {
      const value = stored[key]
      if (typeof value === 'boolean') {
        merged[key] = value
      }
    }
    return merged
  } catch {
    return defaultSettings
  }
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: loadSettings,
  reducers: {
    toggleSetting: (state, action: PayloadAction<keyof SettingsState>) => {
      state[action.payload] = !state[action.payload]
      writeStored(StorageKey.Settings, JSON.stringify(state))
    },
  },
})

export const { toggleSetting } = settingsSlice.actions

export default settingsSlice.reducer
