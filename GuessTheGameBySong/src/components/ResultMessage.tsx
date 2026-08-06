import Confetti from 'react-confetti'
import useWindowDimensions from './others/windowSize'
import { motion } from 'framer-motion'
import './css/resultmessage.css'
import { useAppSelector } from '../store/hooks'
import {
  selectCorrectAnswer,
  selectCurrentSong,
  selectGameEnded,
  selectIsBusy,
  selectIsCorrect,
  selectRoundCompleted,
  selectSettings,
} from '../store/selectors'
import { FADE_IN } from './others/motionPresets'

type ResultMessageProps = {
  handleNextRound: () => void
}

const CONFETTI_PIECES_BY_ATTEMPT = [200, 100, 25]
const NO_CONFETTI = 0

const ResultMessage = ({ handleNextRound }: ResultMessageProps) => {
  const roundCompleted = useAppSelector(selectRoundCompleted)
  const gameEnded = useAppSelector(selectGameEnded)
  const isCorrect = useAppSelector(selectIsCorrect)
  const currentSong = useAppSelector(selectCurrentSong)
  const answer = useAppSelector(selectCorrectAnswer)
  const isBusy = useAppSelector(selectIsBusy)
  const { reduceAnimations } = useAppSelector(selectSettings)

  const { height, width } = useWindowDimensions()

  if (!roundCompleted || gameEnded) {
    return null
  }

  const attemptIndex = Math.min(
    currentSong,
    CONFETTI_PIECES_BY_ATTEMPT.length - 1
  )
  const confettiPieces = isCorrect
    ? CONFETTI_PIECES_BY_ATTEMPT[attemptIndex]
    : NO_CONFETTI

  const successMessages = [
    <p key='first'>
      Too easy! <span>{answer}</span> was the correct answer!
    </p>,
    <p key='second'>
      Not bad! <span>{answer}</span> stood no chance!
    </p>,
    <p key='third'>
      Third time's a charm! In the end <span>{answer}</span> is what you were
      looking for!
    </p>,
  ]

  return (
    <motion.div className='result-message' {...FADE_IN}>
      {isCorrect === false && (
        <p>
          Wrong! Correct answer was: <span>{answer}</span>
        </p>
      )}
      {isCorrect === null && (
        <p>
          Round skipped. The answer was: <span>{answer}</span>
        </p>
      )}
      {isCorrect === true && (
        <>
          {!reduceAnimations && (
            <Confetti
              width={width}
              height={height}
              numberOfPieces={confettiPieces}
            />
          )}
          {successMessages[attemptIndex]}
        </>
      )}
      <button className='button-common' disabled={isBusy} onClick={handleNextRound}>
        Next round
      </button>
    </motion.div>
  )
}

export default ResultMessage
