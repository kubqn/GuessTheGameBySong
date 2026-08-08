import './css/wrongguesses.css'
import { motion } from 'framer-motion'
import { useAppSelector } from '../store/hooks'
import { selectSettings, selectWrongGuesses } from '../store/selectors'
import { FADE_IN } from './others/motionPresets'

const WrongGuesses = () => {
  const wrongGuesses = useAppSelector(selectWrongGuesses)
  const { showMissedGuesses } = useAppSelector(selectSettings)

  if (!showMissedGuesses || wrongGuesses.length === 0) {
    return null
  }

  return (
    <motion.div className='wrong-guesses' {...FADE_IN}>
      <h3 className='wrong-guesses-header'>Missed guesses</h3>
      <ul className='wrong-guesses-list'>
        {wrongGuesses.map(({ text, correctFranchise }) => (
          <li
            key={text}
            className={`wrong-guess${correctFranchise ? ' is-franchise' : ''}`}
          >
            {text}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

export default WrongGuesses
