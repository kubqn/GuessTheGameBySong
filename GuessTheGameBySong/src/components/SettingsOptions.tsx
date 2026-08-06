import './css/settings.css'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectSettings } from '../store/selectors'
import { toggleSetting, type SettingsState } from '../store/settings'

const OPTIONS: {
  key: keyof SettingsState
  label: string
  detail: string
  requires?: keyof SettingsState
}[] = [
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
]

const SettingsOptions = () => {
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)

  return (
    <ul className='settings-list'>
      {OPTIONS.map(({ key, label, detail, requires }) => {
        const locked = requires !== undefined && !settings[requires]
        return (
          <li
            key={key}
            className={`${requires ? 'is-sub' : ''}${locked ? ' is-locked' : ''}`}
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
  )
}

export default SettingsOptions
