export enum StorageKey {
  GameId = 'gtg-game-id',
  Volume = 'volume',
  Settings = 'gtg-settings',
  WrongGuesses = 'gtg-wrong-guesses',
  CheatsheetSize = 'gtg-cheatsheet-size',
  LegacyPlayedGames = 'gtg-played-games',
}

const safely = <T>(run: () => T, fallback: T): T => {
  try {
    return run()
  } catch {
    return fallback
  }
}

export const readStored = (key: StorageKey): string | null =>
  safely(() => localStorage.getItem(key), null)

export const readStoredNumber = (key: StorageKey, fallback: number): number => {
  const raw = readStored(key)
  if (raw === null) {
    return fallback
  }
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const writeStored = (key: StorageKey, value: string) => {
  safely(() => localStorage.setItem(key, value), undefined)
}

export const removeStored = (key: StorageKey) => {
  safely(() => localStorage.removeItem(key), undefined)
}
