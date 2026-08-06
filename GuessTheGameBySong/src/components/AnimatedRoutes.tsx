import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import Home from '../pages/Home'
import Rules from '../pages/Rules'
import Settings from '../pages/Settings'
import Game from '../pages/Game'
import { useAppSelector } from '../store/hooks'
import { selectAnimationType } from '../store/selectors'
import { PageAnimation } from '../store/types'

const SLIDE_DISTANCE_PX = 1000
const PAGE_TRANSITION_SECONDS = 0.5

const offscreen = (animation: PageAnimation, isEntering: boolean) => {
  const direction = isEntering ? 1 : -1
  switch (animation) {
    case PageAnimation.Left:
      return { x: SLIDE_DISTANCE_PX * direction, opacity: 0 }
    case PageAnimation.Right:
      return { x: -SLIDE_DISTANCE_PX * direction, opacity: 0 }
    case PageAnimation.Appear:
      return { opacity: 0 }
  }
}

const pageVariants = {
  initial: (animation: PageAnimation) => offscreen(animation, true),
  in: { x: 0, opacity: 1 },
  out: (animation: PageAnimation) => offscreen(animation, false),
}

const ROUTES: { path: string; element: ReactNode }[] = [
  { path: '/', element: <Home /> },
  { path: '/rules', element: <Rules /> },
  { path: '/settings', element: <Settings /> },
  { path: '/game', element: <Game /> },
]

const AnimatedRoutes = () => {
  const location = useLocation()
  const animationType = useAppSelector(selectAnimationType)

  return (
    <AnimatePresence mode='wait'>
      <Routes location={location} key={location.pathname}>
        {ROUTES.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={
              <motion.div
                initial='initial'
                animate='in'
                exit='out'
                custom={animationType}
                variants={pageVariants}
                transition={{ duration: PAGE_TRANSITION_SECONDS }}
              >
                {element}
              </motion.div>
            }
          />
        ))}
      </Routes>
    </AnimatePresence>
  )
}

export default AnimatedRoutes
