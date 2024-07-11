import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Home from '../pages/Home'
import Rules from '../pages/Rules'
import Game from '../pages/Game'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'

const pageVariants = {
  initial: (animationType: string) => {
    switch (animationType) {
      case 'left':
        return { x: 1000, opacity: 0 }
      case 'right':
        return { x: -1000, opacity: 0 }
      case 'appear':
        return { opacity: 0 }
      default:
        return { opacity: 0 }
    }
  },
  in: {
    x: 0,
    opacity: 1,
  },
  out: (animationType: string) => {
    switch (animationType) {
      case 'left':
        return { x: -1000, opacity: 0 }
      case 'right':
        return { x: 1000, opacity: 0 }
      case 'appear':
        return { opacity: 0 }
      default:
        return { opacity: 0 }
    }
  },
}

const pageTransition = {
  duration: 0.5,
}

const AnimatedRoutes = () => {
  const location = useLocation()
  const animationType = useSelector((state: RootState) => state.animation)

  return (
    <AnimatePresence mode='wait'>
      <Routes location={location} key={location.pathname}>
        <Route
          path='/'
          element={
            <motion.div
              initial='initial'
              animate='in'
              exit='out'
              custom={animationType}
              variants={pageVariants}
              transition={pageTransition}
            >
              <Home />
            </motion.div>
          }
        />
        <Route
          path='/rules'
          element={
            <motion.div
              initial='initial'
              animate='in'
              exit='out'
              custom={animationType}
              variants={pageVariants}
              transition={pageTransition}
            >
              <Rules />
            </motion.div>
          }
        />
        <Route
          path='/game'
          element={
            <motion.div
              initial='initial'
              animate='in'
              exit='out'
              custom={animationType}
              variants={pageVariants}
              transition={pageTransition}
            >
              <Game />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

export default AnimatedRoutes
