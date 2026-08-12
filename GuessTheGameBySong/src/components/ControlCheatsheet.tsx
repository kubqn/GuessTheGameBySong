import './css/cheatsheet.css'
import { motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { useAppSelector } from '../store/hooks'
import { selectSettings } from '../store/selectors'
import {
  formatKeyCode,
  KEY_ACTION_LABELS,
  KEY_ACTION_ORDER,
} from '../store/keybindings'
import { readStored, removeStored, StorageKey, writeStored } from '../storage'
import { FADE_IN } from './others/motionPresets'

const SIZE_SAVE_DELAY_MS = 400

type StoredSize = { width: number; height: number }

const readSize = (): StoredSize | null => {
  const raw = readStored(StorageKey.CheatsheetSize)
  if (!raw) {
    return null
  }
  try {
    const { width, height } = JSON.parse(raw) as Partial<StoredSize>
    if (typeof width === 'number' && typeof height === 'number') {
      return { width, height }
    }
  } catch {
    removeStored(StorageKey.CheatsheetSize)
  }
  return null
}

const CheatsheetPanel = () => {
  const { keyBindings } = useAppSelector(selectSettings)
  const panelRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const panel = panelRef.current
    const size = readSize()
    if (!panel || !size) {
      return
    }
    panel.style.width = `${size.width}px`
    panel.style.height = `${size.height}px`
  }, [])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel || typeof ResizeObserver === 'undefined') {
      return
    }
    let timer = 0
    const observer = new ResizeObserver(() => {
      clearTimeout(timer)
      timer = window.setTimeout(() => {
        writeStored(
          StorageKey.CheatsheetSize,
          JSON.stringify({
            width: panel.offsetWidth,
            height: panel.offsetHeight,
          })
        )
      }, SIZE_SAVE_DELAY_MS)
    })
    observer.observe(panel)
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  return (
    <motion.aside
      className='cheatsheet'
      ref={panelRef}
      aria-label='Keyboard shortcuts'
      {...FADE_IN}
    >
      <h3 className='cheatsheet-title'>Shortcuts</h3>
      <dl className='cheatsheet-list'>
        {KEY_ACTION_ORDER.map((action) => (
          <div className='cheatsheet-row' key={action}>
            <dt className='cheatsheet-action'>{KEY_ACTION_LABELS[action]}</dt>
            <dd className='cheatsheet-key'>
              {formatKeyCode(keyBindings[action])}
            </dd>
          </div>
        ))}
      </dl>
    </motion.aside>
  )
}

const ControlCheatsheet = () => {
  const { keyboardControls, showCheatsheet } = useAppSelector(selectSettings)

  if (!keyboardControls || !showCheatsheet) {
    return null
  }
  return <CheatsheetPanel />
}

export default ControlCheatsheet
