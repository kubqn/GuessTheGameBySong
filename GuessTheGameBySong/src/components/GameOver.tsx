import './css/gameover.css'
import {
  animate,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
} from 'framer-motion'
import { resetState } from '../store/actions'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  selectBonusPoints,
  selectCorrectAnswer,
  selectPoints,
  selectResponseText,
  selectRound,
} from '../store/selectors'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import GameHistory from './GameHistory'
import { STEP_BY_KEY } from './others/arrowSteps'

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
const TITLE_ID = 'game-over-title'
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

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

  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dialogRef.current?.focus()
  }, [])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }
    const stops = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)]
    const first = stops[0]
    const last = stops[stops.length - 1]
    if (!first) {
      if (event.key === 'Tab') {
        event.preventDefault()
      }
      return
    }

    const step = STEP_BY_KEY[event.key]
    if (step !== undefined) {
      event.preventDefault()
      const at = stops.indexOf(document.activeElement as HTMLElement)
      const next =
        at === -1
          ? step > 0
            ? 0
            : stops.length - 1
          : (at + step + stops.length) % stops.length
      stops[next].focus()
      return
    }

    if (event.key !== 'Tab') {
      return
    }
    const leavingBackwards =
      event.shiftKey &&
      (document.activeElement === first || document.activeElement === dialog)
    if (leavingBackwards) {
      event.preventDefault()
      last.focus()
      return
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const spoilsAnswer = Boolean(answer && responseText.includes(answer))

  useEffect(() => {
    let cancelled = false
    const running: AnimationPlaybackControls[] = []

    const countUp = (value: typeof countPoints, target: number) => {
      const animation = animate(value, target, { duration: COUNT_UP_SECONDS })
      running.push(animation)
      return animation
    }

    const popIn = () =>
      controls.start({ scale: 1, transition: { duration: REVEAL_SECONDS } })

    const reveal = async () => {
      try {
        await countUp(countPoints, sumPoints)
        if (cancelled) {
          return
        }
        setShowRound(true)
        popIn()
        await countUp(countRound, round)
        if (cancelled) {
          return
        }
        popIn()
        setShowAnswer(true)
      } catch {
        //nothing left to show
      }
    }
    void reveal()

    return () => {
      cancelled = true
      running.forEach((animation) => animation.stop())
    }
  }, [controls, countPoints, countRound, round, sumPoints])

  return (
    <div className='modal-backdrop'>
      <motion.div
        className='modal-content'
        role='dialog'
        aria-modal='true'
        aria-labelledby={TITLE_ID}
        tabIndex={-1}
        ref={dialogRef}
        onKeyDown={handleKeyDown}
        {...MODAL_ENTRY}
      >
        <h2 id={TITLE_ID}>Game Over</h2>
        {responseText && !spoilsAnswer && <p>{responseText}</p>}
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
        <GameHistory />
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
