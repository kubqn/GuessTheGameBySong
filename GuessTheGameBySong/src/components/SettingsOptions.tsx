import './css/settings.css'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectSettings } from '../store/selectors'
import { toggleSetting, type SettingsState } from '../store/settings'

type Option = {
  key: keyof SettingsState
  label: string
  detail: string
  requires?: keyof SettingsState
}

const GROUPS: { title: string; options: Option[] }[] = [
  {
    title: 'Game',
    options: [
      {
        key: 'strikePlayedGames',
        label: 'Remove song after guessing',
        detail:
          'Games an earlier round already used stay in the suggestions, but crossed out. They can never be the answer again.',
      },
      {
        key: 'showMissedGuesses',
        label: 'Show missed guesses',
        detail:
          'Keeps everything you got wrong this round on screen, so you do not spend a life on the same game twice.',
      },
      {
        key: 'franchiseHint',
        label: 'Hint when guessing the series',
        detail:
          'Colours a miss that came from the right series, so "Batman: Arkham City" tells you the answer is another Batman.',
        requires: 'showMissedGuesses',
      },
      {
        key: 'showRoundCount',
        label: 'Show how far a run can go',
        detail:
          'Puts the size of the library next to the round number, so "Round 3 of 24" tells you how many rounds are left before the games run out.',
      },
    ],
  },
  {
    title: 'UI',
    options: [
      {
        key: 'reduceAnimations',
        label: 'Reduce animations',
        detail:
          'Drops the sliding, zooming and pulsing. Fades stay, because cutting them makes the screen look broken rather than calm.',
      },
      {
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

  const active = GROUPS.find(({ title }) => title === activeTab) ?? GROUPS[0]

  return (
    <div className='settings-group'>
      <div className='settings-tabs' role='tablist'>
        {GROUPS.map(({ title }) => (
          <button
            key={title}
            role='tab'
            aria-selected={title === activeTab}
            className={`settings-tab${title === activeTab ? ' is-active' : ''}`}
            onClick={() => setActiveTab(title)}
          >
            {title}
          </button>
        ))}
      </div>

      <ul className='settings-list' role='tabpanel' aria-label={active.title}>
        {active.options.map(({ key, label, detail, requires }) => {
          const locked = requires !== undefined && !settings[requires]
          return (
            <li
              key={key}
              className={`${requires ? 'is-sub' : ''}${
                locked ? ' is-locked' : ''
              }`}
            >
              <label className='settings-option'>
                <input
                  type='checkbox'
                  checked={settings[key]}
                  disabled={locked}
                  onChange={() => dispatch(toggleSetting(key))}
                />
                <span className='settings-label'>{label}</span>
              </label>
              <p className='settings-detail'>{detail}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default SettingsOptions
