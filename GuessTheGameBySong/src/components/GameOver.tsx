import './css/gameover.css'
import { animate, motion, useAnimation, useMotionValue, useTransform } from 'framer-motion'
import { resetState } from '../store/actions'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  selectBonusPoints,
  selectCorrectAnswer,
  selectPoints,
  selectResponseText,
  selectRound,
} from '../store/selectors'
import { useEffect, useState } from 'react'

const COUNTER_START_VALUE = 500
const COUNT_UP_SECONDS = 2
const REVEAL_SECONDS = 2
const ANSWER_REVEAL_DELAY_SECONDS = 0.5
const MODAL_ENTRY = {
  initial: { y: -100, opacity: 0, rotate: -10 },
  animate: { y: 0, opacity: 1, rotate: 0 },
  exit: { y: 100, opacity: 0, rotate: 10 },
  transition: { duration: 3.5, type: 'spring' as const, bounce: 0.75 },
}
const POP_IN = { scale: 1.5 }

const GameOverModal = () => {
  const dispatch = useAppDispatch()

  const points = useAppSelector(selectPoints)
  const round = useAppSelector(selectRound)
  const bonusPoints = useAppSelector(selectBonusPoints)
  const answer = useAppSelector(selectCorrectAnswer)
  const responseText = useAppSelector(selectResponseText)

  const countPoints = useMotionValue(COUNTER_START_VALUE)
  const countRound = useMotionValue(COUNTER_START_VALUE)

  const roundedPoints = useTransform(countPoints, (latest) =>
    Math.round(latest)
  )
  const roundedRound = useTransform(countRound, (latest) => Math.round(latest))

  const controls = useAnimation()
  const [showRound, setShowRound] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const sumPoints = points + bonusPoints

  useEffect(() => {
    const pointsAnimation = animate(countPoints, sumPoints, {
      duration: COUNT_UP_SECONDS,
    })
    const roundAnimation = animate(countRound, round, {
      duration: COUNT_UP_SECONDS,
    })

    pointsAnimation
      .then(() => {
        setShowRound(true)
        controls.start({ scale: 1, transition: { duration: REVEAL_SECONDS } })
        return roundAnimation
      })
      .then(() => {
        controls.start({ scale: 1, transition: { duration: REVEAL_SECONDS } })
        setShowAnswer(true)
      })

    return () => {
      pointsAnimation.stop()
      roundAnimation.stop()
    }
  }, [controls, countPoints, countRound, round, sumPoints])

  return (
    <div className='modal-backdrop'>
      <motion.div className='modal-content' {...MODAL_ENTRY}>
        <h2>Game Over</h2>
        {responseText && <p>{responseText}</p>}
        <motion.p initial={POP_IN} animate={controls}>
          You acquired: <motion.span>{roundedPoints}</motion.span> points.
        </motion.p>
        {showRound && (
          <motion.p initial={POP_IN} animate={controls}>
            Managed to get to: <motion.span>{roundedRound}</motion.span> round.
          </motion.p>
        )}
        {showAnswer && answer && (
          <motion.p
            initial={{ opacity: 0, ...POP_IN }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: REVEAL_SECONDS,
              delay: ANSWER_REVEAL_DELAY_SECONDS,
            }}
          >
            <span>{answer} </span>
            dealt a final blow to you.
          </motion.p>
        )}
        <button
          className='button-common'
          onClick={() => dispatch(resetState())}
        >
          Restart Game
        </button>
      </motion.div>
    </div>
  )
}

export default GameOverModal
