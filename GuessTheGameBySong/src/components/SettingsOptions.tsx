import './css/settings.css'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FaKeyboard } from 'react-icons/fa'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectSettings } from '../store/selectors'
import { toggleSetting, type BooleanSetting } from '../store/settings'
import KeyBindingsEditor from './KeyBindings'

const KEYBOARD_ICON_SIZE = 26
const SLIDE_SECONDS = 0.35

const SLIDE = {
  options: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
  keys: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
}

type BaseOption = {
  label: string
  detail: string
  requires?: BooleanSetting
}

type Option =
  | (BaseOption & { kind: 'toggle'; key: BooleanSetting })
  | (BaseOption & { kind: 'keys' })

const GROUPS: { title: string; options: Option[] }[] = [
  {
    title: 'Game',
    options: [
      {
        kind: 'toggle',
        key: 'strikePlayedGames',
        label: 'Remove song after guessing',
        detail:
          'Games an earlier round already used stay in the suggestions, but crossed out. They can never be the answer again.',
      },
      {
        kind: 'toggle',
        key: 'showMissedGuesses',
        label: 'Show missed guesses',
        detail:
          'Keeps everything you got wrong this round on screen, so you do not spend a life on the same game twice.',
      },
      {
        kind: 'toggle',
        key: 'franchiseHint',
        label: 'Hint when guessing the series',
        detail:
          'Colours a miss that came from the right series, so "Batman: Arkham City" tells you the answer is another Batman.',
        requires: 'showMissedGuesses',
      },
      {
        kind: 'toggle',
        key: 'showRoundCount',
        label: 'Show how far a run can go',
        detail:
          'Puts the size of the library next to the round number, so "Round 3 of 24" tells you how many rounds are left before the games run out.',
      },
      {
        kind: 'toggle',
        key: 'loopClip',
        label: 'Loop the clip',
        detail:
          'Starts the clip over the moment it ends, so a short snippet keeps going while you think instead of stopping dead.',
      },
    ],
  },
  {
    title: 'Controls',
    options: [
      {
        kind: 'toggle',
        key: 'keyboardControls',
        label: 'Play with the keyboard',
        detail:
          'Switch clips, play, skip and jump into the guess field without reaching for the mouse.',
      },
      {
        kind: 'toggle',
        key: 'showCheatsheet',
        label: 'Show control cheatsheet',
        detail:
          'Parks a read-only list of your shortcuts down the left of the game screen, so you do not have to come back here to check one.',
        requires: 'keyboardControls',
      },
      {
        kind: 'keys',
        label: 'Change the shortcut keys',
        detail:
          'Rebind any of the shortcuts to a key that suits you better.',
        requires: 'keyboardControls',
      },
    ],
  },
  {
    title: 'UI',
    options: [
      {
        kind: 'toggle',
        key: 'reduceAnimations',
        label: 'Reduce animations',
        detail:
          'Drops the sliding, zooming and pulsing. Fades stay, because cutting them makes the screen look broken rather than calm.',
      },
      {
        kind: 'toggle',
        key: 'shuffleBackground',
        label: 'New background every round',
        detail:
          'Lays the background art out again each time a round ends, so every round opens on a different arrangement.',
      },
    ],
  },
]

const SettingsOptions = () => {
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)
  const [activeTab, setActiveTab] = useState(GROUPS[0].title)
  const [editingKeys, setEditingKeys] = useState(false)

  const active = GROUPS.find(({ title }) => title === activeTab) ?? GROUPS[0]
  const transition = { duration: SLIDE_SECONDS }

  return (
    <div className='settings-group'>
      <AnimatePresence mode='wait' initial={false}>
        {editingKeys ? (
          <motion.div key='keys' {...SLIDE.keys} transition={transition}>
            <KeyBindingsEditor onClose={() => setEditingKeys(false)} />
          </motion.div>
        ) : (
          <motion.div key='options' {...SLIDE.options} transition={transition}>
            <div className='settings-tabs' role='tablist'>
              {GROUPS.map(({ title }) => (
                <button
                  key={title}
                  role='tab'
                  aria-selected={title === activeTab}
                  className={`settings-tab${
                    title === activeTab ? ' is-active' : ''
                  }`}
                  onClick={() => setActiveTab(title)}
                >
                  {title}
                </button>
              ))}
            </div>

            <ul
              className='settings-list'
              role='tabpanel'
              aria-label={active.title}
            >
              {active.options.map((option) => {
                const { label, detail, requires } = option
                const locked = requires !== undefined && !settings[requires]

                return (
                  <li
                    key={option.kind === 'toggle' ? option.key : label}
                    className={`${requires ? 'is-sub' : ''}${
                      locked ? ' is-locked' : ''
                    }`}
                  >
                    {option.kind === 'toggle' ? (
                      <label className='settings-option'>
                        <input
                          type='checkbox'
                          checked={settings[option.key]}
                          disabled={locked}
                          onChange={() => dispatch(toggleSetting(option.key))}
                        />
                        <span className='settings-label'>{label}</span>
                      </label>
                    ) : (
                      <div className='settings-option'>
                        <button
                          className='settings-icon-button'
                          disabled={locked}
                          aria-label={label}
                          onClick={() => setEditingKeys(true)}
                        >
                          <FaKeyboard size={KEYBOARD_ICON_SIZE} />
                        </button>
                        <span className='settings-label'>{label}</span>
                      </div>
                    )}
                    <p className='settings-detail'>{detail}</p>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SettingsOptions
