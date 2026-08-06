import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { setAnimationType } from '../store/store'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectGameId } from '../store/selectors'
import { PageAnimation } from '../store/types'

const ARROW_SIZE = 100

const PageNav = () => {
  const dispatch = useAppDispatch()
  const gameId = useAppSelector(selectGameId)

  const navLinks: {
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
      label: gameId ? 'BACK TO RUN' : 'START',
      animation: PageAnimation.Appear,
      icon: <FaAngleRight size={ARROW_SIZE} color='white' />,
      side: 'right',
    },
  ]

  return (
    <>
      {navLinks.map(({ to, label, animation, icon, side }) => (
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
    </>
  )
}

export default PageNav
