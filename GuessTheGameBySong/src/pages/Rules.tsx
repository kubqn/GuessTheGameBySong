import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { setAnimationType } from '../store/store'
import { useAppDispatch } from '../store/hooks'
import { PageAnimation } from '../store/types'

const ARROW_SIZE = 100

const NAV_LINKS: {
  to: string
  label: string
  animation: PageAnimation
  icon: ReactNode
  side: 'left' | 'right'
}[] = [
  {
    to: '/',
    label: 'HOME',
    animation: PageAnimation.Left,
    icon: <FaAngleLeft size={ARROW_SIZE} color='white' />,
    side: 'left',
  },
  {
    to: '/game',
    label: 'START',
    animation: PageAnimation.Appear,
    icon: <FaAngleRight size={ARROW_SIZE} color='white' />,
    side: 'right',
  },
]

const Rules = () => {
  const dispatch = useAppDispatch()
  return (
    <div className='intro-box'>
      <div className='rule-box'>
        {NAV_LINKS.map(({ to, label, animation, icon, side }) => (
          <Link
            key={to}
            onClick={() => dispatch(setAnimationType(animation))}
            to={to}
          >
            <button
              className='navigation-button'
              style={{ [side]: '0px', color: 'white' }}
            >
              {icon}
              <span>{label}</span>
            </button>
          </Link>
        ))}
        <h2 className='rules-header'>Rules:</h2>
        <ul className='rules-list'>
          <li>You get 1 point each time you correctly guess the game.</li>
          <li>You have 5 lives, each wrong guess take 1 live.</li>
          <li className='powerup-rule'>
            After correctly guessing song in 1 attempt you get{' '}
            <span>"Power up point"</span> to use, you can:
            <p>Restore 1 health.</p>
            <p>
              Skip the current guess (you do not earn a point by doing that)
            </p>
            <p>Unlock all songs in the round</p>
            <p>
              Protect yourself from 3 wrong guesses (you do not unlock next
              songs)
            </p>
            <p>
              You can store them to get additional points (1 point per "Power
              up")
            </p>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Rules
