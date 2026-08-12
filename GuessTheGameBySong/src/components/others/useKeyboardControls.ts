import { useEffect, type RefObject } from 'react'
import { setActiveIndex, setIsPlaying } from '../../store/actions'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  selectGameEnded,
  selectGameId,
  selectIsBusy,
  selectIsPlaying,
  selectRoundCompleted,
  selectServableSongIndexes,
  selectSettings,
} from '../../store/selectors'
import { KeyAction, SONG_KEY_ACTIONS } from '../../store/keybindings'

const BUTTON_KEYS = new Set(['Space', 'Enter', 'NumpadEnter'])

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable)

type KeyboardControlsOptions = {
  active: boolean
  inputRef: RefObject<HTMLInputElement>
  powerUpsRef: RefObject<HTMLDivElement>
  onSkip: () => void
}

const useKeyboardControls = ({
  active,
  inputRef,
  powerUpsRef,
  onSkip,
}: KeyboardControlsOptions) => {
  const dispatch = useAppDispatch()

  const { keyboardControls, keyBindings } = useAppSelector(selectSettings)
  const gameId = useAppSelector(selectGameId)
  const isPlaying = useAppSelector(selectIsPlaying)
  const isBusy = useAppSelector(selectIsBusy)
  const roundCompleted = useAppSelector(selectRoundCompleted)
  const gameEnded = useAppSelector(selectGameEnded)
  const servableIndexes = useAppSelector(selectServableSongIndexes)

  const enabled = active && keyboardControls && Boolean(gameId)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.altKey || event.metaKey || event.repeat) {
        return
      }
      if (isTyping(event.target)) {
        return
      }
      if (
        event.target instanceof HTMLElement &&
        event.target.tagName === 'BUTTON' &&
        BUTTON_KEYS.has(event.code)
      ) {
        return
      }

      const songIndex = SONG_KEY_ACTIONS.findIndex(
        (action) => keyBindings[action] === event.code
      )
      if (songIndex !== -1) {
        if (servableIndexes.includes(songIndex)) {
          event.preventDefault()
          dispatch(setActiveIndex(songIndex))
        }
        return
      }

      switch (event.code) {
        case keyBindings[KeyAction.PlayPause]:
          event.preventDefault()
          dispatch(setIsPlaying(!isPlaying))
          return
        case keyBindings[KeyAction.Skip]:
          if (!roundCompleted && !gameEnded && !isBusy) {
            event.preventDefault()
            onSkip()
          }
          return
        case keyBindings[KeyAction.FocusInput]:
          if (inputRef.current) {
            event.preventDefault()
            inputRef.current.focus()
            inputRef.current.select()
          }
          return
        case keyBindings[KeyAction.FocusPowerUps]: {
          const slot =
            powerUpsRef.current?.querySelector<HTMLButtonElement>(
              'button[tabindex="0"]'
            ) ?? powerUpsRef.current?.querySelector('button')
          if (slot) {
            event.preventDefault()
            slot.focus()
          }
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    enabled,
    keyBindings,
    servableIndexes,
    isPlaying,
    isBusy,
    roundCompleted,
    gameEnded,
    inputRef,
    powerUpsRef,
    onSkip,
    dispatch,
  ])
}

export default useKeyboardControls
