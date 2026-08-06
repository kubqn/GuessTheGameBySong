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

type PowerUpProps = {
  onUseAbility: (ability: Ability) => void
}

const ICON_SIZE = 50
const ABILITY_COST = 1
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

/** One-shot version for abilities that stay spent for the rest of the round. */
const SPENT_PULSE = {
  animate: {
    color: ['#000000', '#ff0000'],
    opacity: [1, 0.8, 1],
    scale: [1],
  },
  transition: { duration: PULSE_SECONDS },
}

const PowerUps = ({ onUseAbility }: PowerUpProps) => {
  const bonusPoints = useAppSelector(selectBonusPoints)
  const lives = useAppSelector(selectLives)
  const maxLives = useAppSelector(selectMaxLives)
  const shieldLeft = useAppSelector(selectShieldLeft)
  const allUnlocked = useAppSelector(selectAllUnlocked)
  const roundCompleted = useAppSelector(selectRoundCompleted)
  const gameEnded = useAppSelector(selectGameEnded)
  const isBusy = useAppSelector(selectIsBusy)
  const { reduceAnimations } = useAppSelector(selectSettings)

  const pulse = (preset: { animate: object; transition: object }) =>
    reduceAnimations ? {} : preset

  const abilitiesLocked =
    bonusPoints < ABILITY_COST || roundCompleted || gameEnded || isBusy

  const powerUpList: {
    ability: Ability
    icon: ReactNode
    text: string
    unavailable?: boolean
    animation?: { animate?: object; transition?: object }
  }[] = [
    {
      ability: Ability.ExtraLife,
      icon:
        bonusPoints >= ABILITY_COST ? (
          <FaHeartCirclePlus size={ICON_SIZE} />
        ) : (
          <FaHeartCircleXmark size={ICON_SIZE} />
        ),
      text: 'Restore 1 health',
      unavailable: lives >= maxLives,
    },
    {
      ability: Ability.SkipRound,
      icon: <FaForward size={ICON_SIZE} />,
      text: 'Allows you to go to the next round without losing health',
    },
    {
      ability: Ability.Unlock,
      icon: <FaMusic size={ICON_SIZE} />,
      text: 'Unlocks all 3 songs for this round, without losing attempts and health',
      unavailable: allUnlocked,
      animation: allUnlocked ? pulse(SPENT_PULSE) : {},
    },
    {
      ability: Ability.Shield,
      icon: <FaShieldHeart size={ICON_SIZE} />,
      text:
        shieldLeft > 0
          ? `${shieldLeft} uses left`
          : `You will be protected in your next 3 guesses in this round (skip work normally), preventing both health loss and song unlock`,
      unavailable: shieldLeft > 0,
      animation: shieldLeft > 0 ? pulse(ACTIVE_PULSE) : {},
    },
  ]

  return (
    <>
      <h2 className='power-points-header'>Power Points [{bonusPoints}]</h2>
      {powerUpList.map((button) => {
        const disabled = abilitiesLocked || button.unavailable === true
        return (
          <motion.button
            initial={IDLE_ICON}
            animate={button.animation?.animate}
            transition={button.animation?.transition}
            {...ICON_BUTTON_MOTION}
            key={button.ability}
            disabled={disabled}
            className='button-common'
            style={{
              height: 'auto',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            onClick={() => onUseAbility(button.ability)}
          >
            {button.icon}
            <div className='tooltip-text'>{button.text}</div>
          </motion.button>
        )
      })}
      <div>Hover icon for detail</div>
    </>
  )
}

export default PowerUps
