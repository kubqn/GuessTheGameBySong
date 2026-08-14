import './css/gamehistory.css'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { FaArrowsRotate, FaChevronUp } from 'react-icons/fa6'
import { Ability, type RoundHistoryEntry } from '../api'
import { loadRoundHistory } from '../store/actions'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  selectAbilityCatalog,
  selectHistoryStatus,
  selectRoundHistory,
  selectSettings,
} from '../store/selectors'
import { RequestStatus, RoundOutcome } from '../store/types'
import { ABILITY_ICONS } from './others/abilityIcons'

const CHEVRON_SIZE = 12
const RETRY_ICON_SIZE = 12
const ABILITY_ICON_SIZE = 16
const PANEL_ID = 'game-history-panel'
const NOT_GUESSED = -1

const OUTCOME_LABELS: Record<RoundOutcome, string> = {
  [RoundOutcome.Solved]: 'Guessed',
  [RoundOutcome.Missed]: 'Missed',
  [RoundOutcome.Skipped]: 'Skipped',
}

const PANEL_MOTION = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.3 },
}

const outcomeOf = ({ guessed_correctly, used_powerups }: RoundHistoryEntry) => {
  if (guessed_correctly) {
    return RoundOutcome.Solved
  }
  return used_powerups.includes(Ability.SkipRound)
    ? RoundOutcome.Skipped
    : RoundOutcome.Missed
}

const groupAbilities = (abilities: Ability[]) => {
  const counts = new Map<Ability, number>()
  for (const ability of abilities) {
    if (ABILITY_ICONS[ability]) {
      counts.set(ability, (counts.get(ability) ?? 0) + 1)
    }
  }
  return [...counts]
}

const RoundRow = ({ entry }: { entry: RoundHistoryEntry }) => {
  const catalog = useAppSelector(selectAbilityCatalog)
  const outcome = outcomeOf(entry)

  return (
    <li className={`history-row is-${outcome}`}>
      <span className='history-round'>R{entry.round_number}</span>
      <span className='history-game'>{entry.game}</span>
      <span className='history-detail'>
        <span className='history-outcome'>{OUTCOME_LABELS[outcome]}</span>
        {entry.guessed_on > NOT_GUESSED && (
          <span className='history-attempt'>Attempt {entry.guessed_on + 1}</span>
        )}
      </span>
      <span className='history-abilities'>
        {groupAbilities(entry.used_powerups).map(([ability, used]) => {
          const Icon = ABILITY_ICONS[ability]
          const name = catalog[ability]?.pretty_name ?? ability
          return (
            <span
              className='history-ability'
              key={ability}
              title={used > 1 ? `${name} ×${used}` : name}
            >
              <Icon size={ABILITY_ICON_SIZE} aria-hidden />
              <span className='visually-hidden'>{name}</span>
              {used > 1 && <span className='history-ability-count'>×{used}</span>}
            </span>
          )
        })}
      </span>
    </li>
  )
}

const GameHistory = () => {
  const dispatch = useAppDispatch()
  const history = useAppSelector(selectRoundHistory)
  const status = useAppSelector(selectHistoryStatus)
  const { reduceAnimations } = useAppSelector(selectSettings)
  const [expanded, setExpanded] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    dispatch(loadRoundHistory())
  }, [dispatch])

  useEffect(() => {
    if (!expanded) {
      return
    }
    const collapseOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }
      event.preventDefault()
      setExpanded(false)
      toggleRef.current?.focus()
    }
    window.addEventListener('keydown', collapseOnEscape)
    return () => window.removeEventListener('keydown', collapseOnEscape)
  }, [expanded])

  const failed = status === RequestStatus.Error
  if (!failed && history.length === 0) {
    return null
  }

  const solved = history.filter((entry) => entry.guessed_correctly).length

  return (
    <div className='game-history'>
      <button
        className={`history-toggle${expanded ? ' is-open' : ''}`}
        aria-expanded={expanded}
        aria-controls={PANEL_ID}
        ref={toggleRef}
        onClick={() => setExpanded((open) => !open)}
      >
        <span>Game History</span>
        <FaChevronUp size={CHEVRON_SIZE} aria-hidden />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            className='history-panel'
            id={PANEL_ID}
            {...(reduceAnimations ? {} : PANEL_MOTION)}
          >
            {failed ? (
              <p className='history-summary is-failed'>
                <span>Could not load the history.</span>
                <button
                  className='server-error-retry'
                  onClick={() => dispatch(loadRoundHistory())}
                  aria-label='Retry'
                  title='Retry'
                >
                  <FaArrowsRotate size={RETRY_ICON_SIZE} />
                </button>
              </p>
            ) : (
              <>
                <p className='history-summary'>
                  {solved} of {history.length} guessed
                </p>
                <ul className='history-list'>
                  {history.map((entry) => (
                    <RoundRow key={entry.round_number} entry={entry} />
                  ))}
                </ul>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GameHistory
