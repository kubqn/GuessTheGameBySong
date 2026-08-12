import { useEffect, useState } from 'react'
import { FaAngleLeft } from 'react-icons/fa'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectSettings } from '../store/selectors'
import { setKeyBindings } from '../store/settings'
import {
  CAPTURE_CANCEL_CODE,
  DEFAULT_KEY_BINDINGS,
  findConflicts,
  formatKeyCode,
  isBindableKey,
  KEY_ACTION_LABELS,
  KEY_ACTION_ORDER,
  type KeyAction,
  type KeyBindings,
} from '../store/keybindings'

const BACK_ICON_SIZE = 22

type KeyBindingsProps = {
  onClose: () => void
}

const KeyBindingsEditor = ({ onClose }: KeyBindingsProps) => {
  const dispatch = useAppDispatch()
  const saved = useAppSelector(selectSettings).keyBindings

  const [draft, setDraft] = useState<KeyBindings>(saved)
  const [capturing, setCapturing] = useState<KeyAction | null>(null)
  const [rejected, setRejected] = useState<string | null>(null)

  useEffect(() => {
    if (!capturing) {
      return
    }
    const record = (event: KeyboardEvent) => {
      event.preventDefault()
      event.stopPropagation()

      if (event.code === CAPTURE_CANCEL_CODE) {
        setCapturing(null)
        return
      }
      if (!isBindableKey(event.code)) {
        setRejected(formatKeyCode(event.code) || 'That key')
        return
      }
      setDraft((current) => ({ ...current, [capturing]: event.code }))
      setRejected(null)
      setCapturing(null)
    }

    window.addEventListener('keydown', record, true)
    return () => window.removeEventListener('keydown', record, true)
  }, [capturing])

  const conflicts = findConflicts(draft)
  const isDirty = KEY_ACTION_ORDER.some(
    (action) => draft[action] !== saved[action]
  )

  const startCapture = (action: KeyAction) => {
    setRejected(null)
    setCapturing(action)
  }

  const handleSave = () => {
    dispatch(setKeyBindings(draft))
    onClose()
  }

  return (
    <div className='keybindings'>
      <div className='keybindings-head'>
        <button
          className='keybindings-back'
          onClick={onClose}
          aria-label='Back to settings'
        >
          <FaAngleLeft size={BACK_ICON_SIZE} />
        </button>
        <h3 className='keybindings-title'>Shortcuts</h3>
      </div>

      <p className='keybindings-hint'>
        Pick an action, press the key you want. Esc backs out of recording
        without changing anything.
      </p>

      <ul className='keybindings-list'>
        {KEY_ACTION_ORDER.map((action) => {
          const isRecording = capturing === action
          const clashes = conflicts.has(action)

          return (
            <li
              className={`keybinding${clashes ? ' is-clashing' : ''}`}
              key={action}
            >
              <span className='keybinding-label'>
                {KEY_ACTION_LABELS[action]}
              </span>
              <span
                className={`keybinding-key${isRecording ? ' is-recording' : ''}`}
              >
                {isRecording ? 'Press a key' : formatKeyCode(draft[action])}
              </span>
              <button
                className='keybinding-change'
                disabled={capturing !== null && !isRecording}
                onClick={() =>
                  isRecording ? setCapturing(null) : startCapture(action)
                }
              >
                {isRecording ? 'Cancel' : 'Change key'}
              </button>
            </li>
          )
        })}
      </ul>

      {rejected && (
        <p className='keybindings-warning'>
          {rejected} is reserved by the browser, so it cannot be bound.
        </p>
      )}
      {conflicts.size > 0 && (
        <p className='keybindings-warning'>
          Two actions share a key. Give them separate keys before saving.
        </p>
      )}

      <div className='keybindings-actions'>
        <button
          className='button-common'
          disabled={conflicts.size > 0 || !isDirty}
          onClick={handleSave}
        >
          Save
        </button>
        <button
          className='button-common'
          onClick={() => setDraft(DEFAULT_KEY_BINDINGS)}
        >
          Restore defaults
        </button>
        <button className='button-common' onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default KeyBindingsEditor
