import './css/gameover.css'
import {
  animate,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { resetState } from '../store/actions'
import { RootState } from '../store/store'
import { PowerUpsInterface, RoundInformation } from '../store/reducer'
import { useEffect, useRef, useState } from 'react'

const GameOverModal = () => {
  const POINT_DECREASING = 500

  const dispatch = useDispatch()

  const points = useSelector((state: RootState) => state.app.points)
  const round = useSelector((state: RootState) => state.app.round)
  const index = useSelector((state: RootState) => state.app.index)

  const roundInformation = useSelector(
    (state: RootState) => state.app.roundInformation as RoundInformation[]
  )
  const powerPoints = useSelector(
    (state: RootState) => state.app.powerUps as PowerUpsInterface
  ).points

  const countPoints = useMotionValue(POINT_DECREASING)
  const countRound = useMotionValue(POINT_DECREASING)

  const roundedPoints = useTransform(countPoints, (latest) =>
    Math.round(latest)
  )
  const roundedRound = useTransform(countRound, (latest) => Math.round(latest))

  const controls = useAnimation()
  const showRoundRef = useRef(false)
  const [showRound, setShowRound] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const sumPoints = points + powerPoints

  useEffect(() => {
    const pointsAnimation = animate(countPoints, sumPoints, { duration: 2 })
    const roundAnimation = animate(countRound, round, { duration: 2 })

    if (showRoundRef.current) {
      pointsAnimation
        .then(() => {
          setShowRound(true)
          controls.start({
            scale: 1,
            transition: { duration: 2 },
          })
        })
        .then(() => {
          roundAnimation.play()
          roundAnimation.then(() => {
            controls.start({
              scale: 1,
              transition: { duration: 2 },
            })
            setShowAnswer(true)
          })
        })
    } else {
      showRoundRef.current = true
    }

    return () => {
      if (pointsAnimation) pointsAnimation.stop()
      if (roundAnimation) roundAnimation.stop()
    }
  }, [])

  const handleReset = () => {
    dispatch(resetState())
  }

  return (
    <div className='modal-backdrop'>
      <motion.div
        className='modal-content'
        initial={{ y: -100, opacity: 0, rotate: -10 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        exit={{ y: 100, opacity: 0, rotate: 10 }}
        transition={{ duration: 3.5, type: 'spring', bounce: 0.75 }}
      >
        <h2>Game Over</h2>
        <motion.p initial={{ scale: 1.5 }} animate={controls}>
          You acquired: <motion.span>{roundedPoints}</motion.span> points.
        </motion.p>
        {showRound && (
          <motion.p initial={{ scale: 1.5 }} animate={controls}>
            Managed to get to: <motion.span>{roundedRound}</motion.span> round.
          </motion.p>
        )}
        {showAnswer && (
          <motion.p
            initial={{ opacity: 0, scale: 1.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
          >
            <span>
              {roundInformation !== null ? roundInformation[index].answer : ''}{' '}
            </span>
            dealt a final blow to you.
          </motion.p>
        )}
        <button className='button-common' onClick={handleReset}>
          Restart Game
        </button>
      </motion.div>
    </div>
  )
}

export default GameOverModal
