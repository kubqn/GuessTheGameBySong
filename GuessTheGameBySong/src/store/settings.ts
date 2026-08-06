import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { readStored, StorageKey, writeStored } from '../storage'

export interface SettingsState {
  strikePlayedGames: boolean
  franchiseHint: boolean
  showMissedGuesses: boolean
}

const defaultSettings: SettingsState = {
  strikePlayedGames: false,
  franchiseHint: false,
  showMissedGuesses: false,
}

const loadSettings = (): SettingsState => {
  const raw = readStored(StorageKey.Settings)
  if (!raw) {
    return defaultSettings
  }
  try {
    const stored = JSON.parse(raw) as Partial<SettingsState>
    return {
      strikePlayedGames:
        stored.strikePlayedGames ?? defaultSettings.strikePlayedGames,
      franchiseHint: stored.franchiseHint ?? defaultSettings.franchiseHint,
      showMissedGuesses:
        stored.showMissedGuesses ?? defaultSettings.showMissedGuesses,
    }
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
