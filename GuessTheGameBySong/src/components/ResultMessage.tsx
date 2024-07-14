import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import Confetti from 'react-confetti'
import useWindowDimensions from './others/windowSize'
import { motion } from 'framer-motion'
import './css/resultmessage.css'

type ResultMessageProps = {
  answer: string
  handleNextRound: () => void
}

const ResultMessage = ({ answer, handleNextRound }: ResultMessageProps) => {
  const attemptNumber = useSelector(
    (state: RootState) => state.app.attemptNumber
  )
  const life = useSelector((state: RootState) => state.app.life)

  const isCorrectAnswer = useSelector(
    (state: RootState) => state.app.isCorrectAnswer
  )

  const { height, width } = useWindowDimensions()

  return (
    (isCorrectAnswer || attemptNumber === 4) && (
      <motion.div
        className='result-message'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {attemptNumber === 4 && (
          <p>
            Wrong! Correct answer was: <span>{answer}</span>
          </p>
        )}
        {isCorrectAnswer && attemptNumber === 1 && (
          <>
            <Confetti width={width} height={height} numberOfPieces={200} />
            <p>
              Too easy! <span>{answer}</span> was the correct answer!
            </p>
          </>
        )}
        {isCorrectAnswer && attemptNumber === 2 && (
          <>
            <Confetti width={width} height={height} numberOfPieces={100} />
            <p>
              Not bad! <span> {answer}</span> stood no chance!
            </p>
          </>
        )}
        {isCorrectAnswer && attemptNumber === 3 && (
          <>
            <Confetti width={width} height={height} numberOfPieces={25} />
            <p>
              Third time's a charm! In the end <span>{answer}</span> is what you
              were looking for!
            </p>
          </>
        )}
        {life > 0 && (
          <button className='button-common' onClick={handleNextRound}>
            Next round
          </button>
        )}
      </motion.div>
    )
  )
}

export default ResultMessage
