import './css/powerups.css'
import { FaHeartCircleXmark } from 'react-icons/fa6'
import { CiBadgeDollar, CiTimer } from 'react-icons/ci'
import { motion } from 'framer-motion'
import { useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { Ability, type AbilityInfo } from '../api'
import { KeyAction } from '../store/keybindings'
import { useAppSelector } from '../store/hooks'
import useCoarsePointer from './others/useCoarsePointer'
import { ABILITY_ICONS } from './others/abilityIcons'
import {
  selectAbilityCatalog,
  selectAbilityCooldowns,
  selectAllUnlocked,
  selectBonusPoints,
  selectGameEnded,
  selectIsBusy,
  selectLives,
  selectMaxLives,
  selectRoundCompleted,
  selectSettings,
  selectShieldLeft,
} from '../store/selectors'
import { ICON_BUTTON_MOTION } from './others/motionPresets'

const ICON_SIZE = 50
const META_ICON_SIZE = 18
const COOLDOWN_ICON_SIZE = 16
const PULSE_SECONDS = 3
const IDLE_ICON = { color: '#000000', opacity: 1, scale: 1 }

const ACTIVE_PULSE = {
  animate: {
    color: ['#000000', '#ff0000', '#000000'],
    opacity: [1, 0.8, 1],
    scale: [0.8, 0.9, 1],
  },
  transition: {
    duration: PULSE_SECONDS,
    repeat: Infinity,
    repeatType: 'reverse' as const,
  },
}

const SPENT_PULSE = {
  animate: {
    color: ['#000000', '#ff0000'],
    opacity: [1, 0.8, 1],
    scale: [1],
  },
  transition: { duration: PULSE_SECONDS },
}

type PowerUpProps = {
  onUseAbility: (ability: Ability) => void
  fullSongsLoading: boolean
  stripRef: RefObject<HTMLDivElement>
}

const ORDER: Ability[] = [
  Ability.ExtraLife,
  Ability.SkipRound,
  Ability.Unlock,
  Ability.Shield,
]

const STEP_BY_KEY: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
}

const AbilityDetail = ({
  info,
  cooldownLeft,
}: {
  info: AbilityInfo
  cooldownLeft: number
}) => (
  <>
    <strong>
      {info.pretty_name} — {info.cost}{' '}
      {info.cost === 1 ? 'point' : 'points'}
    </strong>
    <span>{info.description}</span>
    {info.cooldown > 0 && (
      <span className={cooldownLeft > 0 ? 'is-cooling' : ''}>
        {cooldownLeft > 0
          ? `On cooldown for ${cooldownLeft} more ${
              cooldownLeft === 1 ? 'round' : 'rounds'
            }`
          : `Cooldown: ${info.cooldown} rounds`}
      </span>
    )}
  </>
)

const PowerUps = ({
  onUseAbility,
  fullSongsLoading,
  stripRef,
}: PowerUpProps) => {
  const bonusPoints = useAppSelector(selectBonusPoints)
  const lives = useAppSelector(selectLives)
  const maxLives = useAppSelector(selectMaxLives)
  const shieldLeft = useAppSelector(selectShieldLeft)
  const allUnlocked = useAppSelector(selectAllUnlocked)
  const roundCompleted = useAppSelector(selectRoundCompleted)
  const gameEnded = useAppSelector(selectGameEnded)
  const isBusy = useAppSelector(selectIsBusy)
  const catalog = useAppSelector(selectAbilityCatalog)
  const cooldowns = useAppSelector(selectAbilityCooldowns)
  const { reduceAnimations, keyBindings } = useAppSelector(selectSettings)

  const [focusedIndex, setFocusedIndex] = useState(0)
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([])

  const coarsePointer = useCoarsePointer()
  const [tapped, setTapped] = useState<Ability | null>(null)

  const pulse = (preset: { animate: object; transition: object }) =>
    reduceAnimations ? {} : preset

  const roundLocked = roundCompleted || gameEnded || isBusy

  const available = ORDER.filter((ability) => catalog[ability])

  const tappedDetail = tapped ? catalog[tapped] : undefined
  const tappedInfo = tappedDetail
    ? { info: tappedDetail, cooldownLeft: cooldowns[tapped!] ?? 0 }
    : null

  const focusAt = (index: number) => {
    setFocusedIndex(index)
    buttonsRef.current[index]?.focus()
  }

  const handleStripKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.code === keyBindings[KeyAction.ReleaseFocus]) {
      event.preventDefault()
      buttonsRef.current[focusedIndex]?.blur()
      return
    }
    const step = STEP_BY_KEY[event.key]
    if (step !== undefined) {
      event.preventDefault()
      focusAt((focusedIndex + step + available.length) % available.length)
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      focusAt(0)
    }
    if (event.key === 'End') {
      event.preventDefault()
      focusAt(available.length - 1)
    }
  }

  const iconFor = (ability: Ability, affordable: boolean): ReactNode => {
    const Icon =
      ability === Ability.ExtraLife && !affordable
        ? FaHeartCircleXmark
        : ABILITY_ICONS[ability]
    return <Icon size={ICON_SIZE} />
  }

  const spentFor = (ability: Ability) => {
    if (ability === Ability.Unlock) {
      return allUnlocked
    }
    if (ability === Ability.Shield) {
      return shieldLeft > 0
    }
    if (ability === Ability.ExtraLife) {
      return lives >= maxLives
    }
    return false
  }

  const handlePress = (ability: Ability, disabled: boolean) => {
    if (coarsePointer && tapped !== ability) {
      setTapped(ability)
      return
    }
    if (disabled) {
      return
    }
    setTapped(null)
    onUseAbility(ability)
  }

  const animationFor = (
    ability: Ability
  ): { animate?: object; transition?: object } => {
    if (ability === Ability.Unlock && allUnlocked) {
      return pulse(SPENT_PULSE)
    }
    if (ability === Ability.Shield && shieldLeft > 0) {
      return pulse(ACTIVE_PULSE)
    }
    return {}
  }

  return (
    <>
      <h2 className='power-points-header'>Power Points [{bonusPoints}]</h2>
      <div
        className={`power-ups${reduceAnimations ? ' is-still' : ''}`}
        role='toolbar'
        aria-label='Power ups'
        ref={stripRef}
        onKeyDown={handleStripKeyDown}
      >
        {available.map((ability, index) => {
          const info = catalog[ability]!
          const cooldownLeft = cooldowns[ability] ?? 0
          const affordable = bonusPoints >= info.cost
          const spent = spentFor(ability)
          const disabled = roundLocked || !affordable || cooldownLeft > 0 || spent
          const animation = animationFor(ability)

          return (
            <div
              className={`power-up-slot${
                tapped === ability ? ' is-tapped' : ''
              }`}
              key={ability}
            >
              <motion.button
                initial={IDLE_ICON}
                animate={animation.animate}
                transition={animation.transition}
                {...(disabled ? {} : ICON_BUTTON_MOTION)}
                aria-disabled={disabled}
                ref={(node) => (buttonsRef.current[index] = node)}
                tabIndex={index === focusedIndex ? 0 : -1}
                onFocus={() => setFocusedIndex(index)}
                className='button-common power-up'
                style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
                onClick={() => handlePress(ability, disabled)}
              >
                {iconFor(ability, affordable)}
                <span className='power-up-cost'>
                  <CiBadgeDollar size={META_ICON_SIZE} />
                  {info.cost}
                </span>
                <div className='tooltip-text'>
                  <AbilityDetail info={info} cooldownLeft={cooldownLeft} />
                </div>
              </motion.button>
              <span
                className={`power-up-cooldown${
                  cooldownLeft > 0 ? '' : ' is-idle'
                }`}
              >
                <CiTimer size={COOLDOWN_ICON_SIZE} />
                {cooldownLeft}
              </span>
            </div>
          )
        })}
      </div>
      {coarsePointer && tappedInfo && (
        <div className='power-up-detail'>
          <AbilityDetail
            info={tappedInfo.info}
            cooldownLeft={tappedInfo.cooldownLeft}
          />
        </div>
      )}
      {fullSongsLoading && (
        <div className='power-ups-loading'>Full songs still downloading...</div>
      )}
      <div className='power-ups-hint'>
        {coarsePointer
          ? 'Tap an icon to read it, tap again to use it'
          : 'Hover or focus an icon for detail'}
      </div>
    </>
  )
}

export default PowerUps
