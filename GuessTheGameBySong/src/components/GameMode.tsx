import './css/gamemode.css'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

interface GameModeProps {
  onChooseMode: (infinite: boolean) => void
  isStarting: boolean
  error: string | null
}

const TILT_RANGE = 100
const TILT_INPUT = [-TILT_RANGE, 0, TILT_RANGE]

const BACKGROUNDS = [
  'linear-gradient(180deg, rgb(0,0,0) 0%, rgb(255, 255, 255) 100%)',
  'linear-gradient(180deg, #000000 0%, rgb(79, 78, 80) 100%)',
  'linear-gradient(180deg, rgb(255, 255, 255) 0%, rgb(0, 0, 0) 100%)',
]
const ICON_COLORS = ['rgb(100, 100, 100)', 'rgb(0, 0, 0)', 'rgb(158, 158, 158)']

const MODES = [
  {
    infinite: true,
    label: 'ENDLESS MODE',
    hint: '(infinity lives)',
    side: 'left' as const,
  },
  {
    infinite: false,
    label: 'NORMAL MODE',
    hint: '(power ups and 5 lives)',
    side: 'right' as const,
  },
]

const GameMode = ({ onChooseMode, isStarting, error }: GameModeProps) => {
  const [pendingMode, setPendingMode] = useState<boolean | null>(null)
  const x = useMotionValue(0)
  const background = useTransform(x, TILT_INPUT, BACKGROUNDS)
  const color = useTransform(x, TILT_INPUT, ICON_COLORS)
  const leftPathLength = useTransform(x, [-TILT_RANGE, 0], [1, 0])
  const rightPathLength = useTransform(x, [0, TILT_RANGE], [0, 1])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const ratio = e.clientX / window.innerWidth
      x.set(ratio * TILT_RANGE * 2 - TILT_RANGE)
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [x])

  return (
    <motion.div className='container' style={{ background }}>
      {MODES.map(({ infinite, label, hint, side }) => {
        const isPending = isStarting && pendingMode === infinite
        return (
          <button
            key={label}
            className={`navigation-button game-mode${
              isStarting ? ' is-waiting' : ''
            }`}
            style={{ [side]: '0px', color: 'white' }}
            disabled={isStarting}
            aria-busy={isPending}
            onClick={() => {
              setPendingMode(infinite)
              onChooseMode(infinite)
            }}
          >
            {label}
            <p>{isPending ? 'Loading...' : hint}</p>
          </button>
        )
      })}
      <motion.div className='box' style={{ x }}>
        <p className='gamemode-info'>{isStarting ? 'LOADING' : 'MODE'}</p>
        <svg className='progress-icon'>
          <motion.path
            d='M 1 1 L 1 98 M 1 1 L 98 1 M 1 48.5 L 98 48.5 M 1 98 L 98 98'
            fill='none'
            stroke={color}
            strokeWidth='2'
            strokeDasharray='0 1'
            style={{ pathLength: leftPathLength }}
          />
          <motion.path
            d='M 1 1 L 1 98 M 102 98 L 1 1 M 102 1 L 102 98'
            fill='none'
            stroke={color}
            strokeWidth='2'
            strokeDasharray='0 1'
            style={{ pathLength: rightPathLength }}
          />
        </svg>
      </motion.div>
      {isStarting && (
        <p className='game-mode-status' role='status'>
          Contacting the game server...
        </p>
      )}
      {error && <p className='game-mode-error'>{error}</p>}
    </motion.div>
  )
}

export default GameMode
