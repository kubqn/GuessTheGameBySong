import './css/powerups.css'
import { FaForward } from 'react-icons/fa'
import {
  FaHeartCirclePlus,
  FaHeartCircleXmark,
  FaShieldHeart,
  FaMusic,
} from 'react-icons/fa6'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Ability } from '../api'
import { useAppSelector } from '../store/hooks'
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
}

const ORDER: Ability[] = [
  Ability.ExtraLife,
  Ability.SkipRound,
  Ability.Unlock,
  Ability.Shield,
]

const PowerUps = ({ onUseAbility }: PowerUpProps) => {
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
  const { reduceAnimations } = useAppSelector(selectSettings)

  const pulse = (preset: { animate: object; transition: object }) =>
    reduceAnimations ? {} : preset

  const roundLocked = roundCompleted || gameEnded || isBusy

  const iconFor = (ability: Ability, affordable: boolean): ReactNode => {
    switch (ability) {
      case Ability.ExtraLife:
        return affordable ? (
          <FaHeartCirclePlus size={ICON_SIZE} />
        ) : (
          <FaHeartCircleXmark size={ICON_SIZE} />
        )
      case Ability.SkipRound:
        return <FaForward size={ICON_SIZE} />
      case Ability.Unlock:
        return <FaMusic size={ICON_SIZE} />
      case Ability.Shield:
        return <FaShieldHeart size={ICON_SIZE} />
    }
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
      <div className='power-ups'>
        {ORDER.map((ability) => {
          const info = catalog[ability]
          if (!info) {
            return null
          }
          const cooldownLeft = cooldowns[ability] ?? 0
          const affordable = bonusPoints >= info.cost
          const spent = spentFor(ability)
          const disabled = roundLocked || !affordable || cooldownLeft > 0 || spent
          const animation = animationFor(ability)

          return (
            <motion.button
              initial={IDLE_ICON}
              animate={animation.animate}
              transition={animation.transition}
              {...ICON_BUTTON_MOTION}
              key={ability}
              disabled={disabled}
              className='button-common power-up'
              style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
              onClick={() => onUseAbility(ability)}
            >
              {iconFor(ability, affordable)}
              <span className='power-up-cost'>
                {info.cost}
                {cooldownLeft > 0 && ` · ${cooldownLeft}`}
              </span>
              <div className='tooltip-text'>
                <strong>
                  {info.pretty_name} — {info.cost}{' '}
                  {info.cost === 1 ? 'point' : 'points'}
                </strong>
                <span>{info.description}</span>
                {info.cooldown > 0 && (
                  <span>
                    {cooldownLeft > 0
                      ? `On cooldown for ${cooldownLeft} more ${
                          cooldownLeft === 1 ? 'round' : 'rounds'
                        }`
                      : `Cooldown: ${info.cooldown} rounds`}
                  </span>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
      <div>Hover icon for detail</div>
    </>
  )
}

export default PowerUps
