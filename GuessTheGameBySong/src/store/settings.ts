import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { readStored, StorageKey, writeStored } from '../storage'
import {
  DEFAULT_KEY_BINDINGS,
  readKeyBindings,
  type KeyBindings,
} from './keybindings'

export interface SettingsState {
  strikePlayedGames: boolean
  franchiseHint: boolean
  showMissedGuesses: boolean
  showRoundCount: boolean
  keyboardControls: boolean
  showCheatsheet: boolean
  loopClip: boolean
  reduceAnimations: boolean
  shuffleBackground: boolean
  keyBindings: KeyBindings
}

export type BooleanSetting = {
  [Key in keyof SettingsState]: SettingsState[Key] extends boolean ? Key : never
}[keyof SettingsState]

const defaultSettings: SettingsState = {
  strikePlayedGames: false,
  franchiseHint: false,
  showMissedGuesses: false,
  showRoundCount: false,
  keyboardControls: true,
  showCheatsheet: false,
  loopClip: false,
  reduceAnimations: false,
  shuffleBackground: false,
  keyBindings: DEFAULT_KEY_BINDINGS,
}

const BOOLEAN_KEYS = (
  Object.keys(defaultSettings) as (keyof SettingsState)[]
).filter((key) => typeof defaultSettings[key] === 'boolean') as BooleanSetting[]

const loadSettings = (): SettingsState => {
  const raw = readStored(StorageKey.Settings)
  if (!raw) {
    return defaultSettings
  }
  try {
    const stored = JSON.parse(raw) as Partial<SettingsState>
    const merged = { ...defaultSettings }
    for (const key of BOOLEAN_KEYS) {
      const value = stored[key]
      if (typeof value === 'boolean') {
        merged[key] = value
      }
    }
    merged.keyBindings = readKeyBindings(stored.keyBindings)
    return merged
  } catch {
    return defaultSettings
  }
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: loadSettings,
  reducers: {
    toggleSetting: (state, action: PayloadAction<BooleanSetting>) => {
      state[action.payload] = !state[action.payload]
      writeStored(StorageKey.Settings, JSON.stringify(state))
    },
    setKeyBindings: (state, action: PayloadAction<KeyBindings>) => {
      state.keyBindings = action.payload
      writeStored(StorageKey.Settings, JSON.stringify(state))
    },
  },
})

export const { toggleSetting, setKeyBindings } = settingsSlice.actions

export default settingsSlice.reducer
