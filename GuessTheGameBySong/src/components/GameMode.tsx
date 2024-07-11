import './css/gamemode.css'
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimationFrame,
} from 'framer-motion'

interface GameModeProps {
  setIsEndless: (value: boolean) => void
  setIsGameModeChosen: (value: boolean) => void
}

const GameMode = ({ setIsEndless, setIsGameModeChosen }: GameModeProps) => {
  const x = useMotionValue(0)
  const xInput = [-100, 0, 100]
  const background = useTransform(x, xInput, [
    'linear-gradient(180deg, rgb(0,0,0) 0%, rgb(255, 255, 255) 100%)',
    'linear-gradient(180deg, #000000 0%, rgb(79, 78, 80) 100%)',
    'linear-gradient(180deg, rgb(255, 255, 255) 0%, rgb(0, 0, 0) 100%)',
  ])
  const color = useTransform(x, xInput, [
    'rgb(100, 100, 100)',
    'rgb(0, 0, 0)',
    'rgb(158, 158, 158)',
  ])

  const width = window.innerWidth

  useAnimationFrame(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX
      const normalizedX = (mouseX / width) * 200 - 100
      x.set(normalizedX)
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  })

  return (
    <motion.div className='container' style={{ background }}>
      <button
        className='navigation-button game-mode'
        style={{ left: '0px', color: 'white' }}
        onClick={() => {
          setIsEndless(true), setIsGameModeChosen(true)
        }}
      >
        ENDLESS MODE
        <p>(infinity lives)</p>
      </button>

      <button
        className='navigation-button game-mode'
        style={{ right: '0px', color: 'white' }}
        onClick={() => {
          setIsEndless(false), setIsGameModeChosen(true)
        }}
      >
        NORMAL MODE
        <p>(power ups and 5 lives)</p>
      </button>
      <motion.div className='box' style={{ x }}>
        <p className='gamemode-info'>MODE</p>
        <svg className='progress-icon'>
          <motion.path
            d='M 1 1 L 1 98 M 1 1 L 98 1 M 1 48.5 L 98 48.5 M 1 98 L 98 98'
            fill='none'
            stroke={color}
            strokeWidth='2'
            strokeDasharray='0 1'
            style={{ pathLength: useTransform(x, [-100, 0], [1, 0]) }}
          />
          <motion.path
            d='M 1 1 L 1 98 M 102 98 L 1 1 M 102 1 L 102 98'
            fill='none'
            stroke={color}
            strokeWidth='2'
            strokeDasharray='0 1'
            style={{ pathLength: useTransform(x, [0, 100], [0, 1]) }}
          />
        </svg>
      </motion.div>
    </motion.div>
  )
}

export default GameMode
