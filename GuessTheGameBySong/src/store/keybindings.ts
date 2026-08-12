export enum KeyAction {
  Song1 = 'song1',
  Song2 = 'song2',
  Song3 = 'song3',
  PlayPause = 'playPause',
  Skip = 'skip',
  FocusInput = 'focusInput',
  FocusPowerUps = 'focusPowerUps',
  ReleaseFocus = 'releaseFocus',
}

export type KeyBindings = Record<KeyAction, string>

export const DEFAULT_KEY_BINDINGS: KeyBindings = {
  [KeyAction.Song1]: 'Digit1',
  [KeyAction.Song2]: 'Digit2',
  [KeyAction.Song3]: 'Digit3',
  [KeyAction.PlayPause]: 'Space',
  [KeyAction.Skip]: 'KeyS',
  [KeyAction.FocusInput]: 'Enter',
  [KeyAction.FocusPowerUps]: 'KeyQ',
  [KeyAction.ReleaseFocus]: 'Escape',
}

export const SONG_KEY_ACTIONS: KeyAction[] = [
  KeyAction.Song1,
  KeyAction.Song2,
  KeyAction.Song3,
]

export const KEY_ACTION_ORDER: KeyAction[] = [
  ...SONG_KEY_ACTIONS,
  KeyAction.PlayPause,
  KeyAction.Skip,
  KeyAction.FocusInput,
  KeyAction.FocusPowerUps,
  KeyAction.ReleaseFocus,
]

export const KEY_ACTION_LABELS: Record<KeyAction, string> = {
  [KeyAction.Song1]: 'Switch to clip 1',
  [KeyAction.Song2]: 'Switch to clip 2',
  [KeyAction.Song3]: 'Switch to clip 3',
  [KeyAction.PlayPause]: 'Play / pause',
  [KeyAction.Skip]: 'Skip the clip',
  [KeyAction.FocusInput]: 'Jump to the guess field',
  [KeyAction.FocusPowerUps]: 'Jump to the power ups',
  [KeyAction.ReleaseFocus]: 'Leave the current focus',
}

export const CAPTURE_CANCEL_CODE = 'Escape'

const UNBINDABLE = new Set([
  'Tab',
  'F5',
  'ShiftLeft',
  'ShiftRight',
  'ControlLeft',
  'ControlRight',
  'AltLeft',
  'AltRight',
  'MetaLeft',
  'MetaRight',
  'CapsLock',
  'ContextMenu',
])

export const isBindableKey = (code: string) =>
  code.length > 0 && !UNBINDABLE.has(code)

const NAMED_KEYS: Record<string, string> = {
  Space: 'Space',
  Enter: 'Enter',
  NumpadEnter: 'Num Enter',
  Escape: 'Esc',
  Backspace: 'Backspace',
  Delete: 'Del',
  Insert: 'Ins',
  Home: 'Home',
  End: 'End',
  PageUp: 'PgUp',
  PageDown: 'PgDn',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Backquote: '`',
  Minus: '-',
  Equal: '=',
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Semicolon: ';',
  Quote: "'",
  Comma: ',',
  Period: '.',
  Slash: '/',
}

const KEY_PREFIX = 'Key'
const DIGIT_PREFIX = 'Digit'
const NUMPAD_PREFIX = 'Numpad'

export const formatKeyCode = (code: string): string => {
  const named = NAMED_KEYS[code]
  if (named) {
    return named
  }
  if (code.startsWith(KEY_PREFIX)) {
    return code.slice(KEY_PREFIX.length)
  }
  if (code.startsWith(DIGIT_PREFIX)) {
    return code.slice(DIGIT_PREFIX.length)
  }
  if (code.startsWith(NUMPAD_PREFIX)) {
    return `Num ${code.slice(NUMPAD_PREFIX.length)}`
  }
  return code
}

export const findConflicts = (bindings: KeyBindings): Set<KeyAction> => {
  const byCode = new Map<string, KeyAction[]>()
  for (const action of KEY_ACTION_ORDER) {
    const code = bindings[action]
    byCode.set(code, [...(byCode.get(code) ?? []), action])
  }

  const clashing = new Set<KeyAction>()
  for (const actions of byCode.values()) {
    if (actions.length > 1) {
      actions.forEach((action) => clashing.add(action))
    }
  }
  return clashing
}

export const readKeyBindings = (stored: unknown): KeyBindings => {
  const merged = { ...DEFAULT_KEY_BINDINGS }
  if (typeof stored !== 'object' || stored === null) {
    return merged
  }
  const candidate = stored as Partial<Record<KeyAction, unknown>>
  for (const action of KEY_ACTION_ORDER) {
    const code = candidate[action]
    if (typeof code === 'string' && isBindableKey(code)) {
      merged[action] = code
    }
  }
  return merged
}
