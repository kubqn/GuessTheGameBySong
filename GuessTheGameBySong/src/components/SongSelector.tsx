import './css/songselector.css'
import { useSelector, useDispatch } from 'react-redux'
import { setActiveIndex, setIsPlaying } from '../store/actions'
import { FaForward } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { RootState } from '../store/store'
import { PowerUpsInterface } from '../store/reducer'

interface SongSelectorProps {
  onSkip: () => void
}

const SongSelector = ({ onSkip }: SongSelectorProps) => {
  const dispatch = useDispatch()

  const activeIndex = useSelector((state: RootState) => state.app.activeIndex)
  const life = useSelector((state: RootState) => state.app.life)

  const attemptNumber = useSelector(
    (state: RootState) => state.app.attemptNumber
  )
  const isCorrectAnswer = useSelector(
    (state: RootState) => state.app.isCorrectAnswer
  )
  const unlockedButtons = useSelector(
    (state: RootState) => state.app.powerUps as PowerUpsInterface
  ).unlockedButtons

  const songButtons = [1, 2, 3]

  const handleButtonClick = (index: number) => {
    dispatch(setActiveIndex(index))
    dispatch(setIsPlaying(false))
  }

  const buttonClass = (index: number) => {
    let className = 'song-button'
    if (activeIndex === index) {
      className = 'song-button active'
    } else if (index >= attemptNumber && !isCorrectAnswer) {
      className = 'song-button disabled'
    }
    return className
  }

  const handleDisabled = (index: number) => {
    if (unlockedButtons || isCorrectAnswer) {
      return false
    } else if (index + 1 > attemptNumber) {
      return true
    }
  }

  return (
    <div className='song-selector'>
      {songButtons.map((button, index) => (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={handleDisabled(index)}
          key={index}
          onClick={() => handleButtonClick(index)}
          className={buttonClass(index)}
        >
          {button}
        </motion.button>
      ))}
      {attemptNumber < 4 && !isCorrectAnswer && life > 0 && (
        <motion.button
          className='skip-button'
          onClick={onSkip}
          whileTap={{ scale: 0.9 }}
        >
          <FaForward size={17} />
          <div className='tooltip-text'>
            If you have no idea what song is this you can skip it instead of
            blindly guessing
          </div>
        </motion.button>
      )}
    </div>
  )
}

export default SongSelector
