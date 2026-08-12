import './css/songselector.css'
import { setActiveIndex } from '../store/actions'
import { FaForward } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  selectActiveIndex,
  selectGameEnded,
  selectIsBusy,
  selectRoundCompleted,
  selectServableSongIndexes,
  selectTotalSongs,
} from '../store/selectors'
import { ICON_BUTTON_MOTION } from './others/motionPresets'

interface SongSelectorProps {
  onSkip: () => void
}

const SKIP_ICON_SIZE = 17

const SongSelector = ({ onSkip }: SongSelectorProps) => {
  const dispatch = useAppDispatch()

  const activeIndex = useAppSelector(selectActiveIndex)
  const totalSongs = useAppSelector(selectTotalSongs)
  const roundCompleted = useAppSelector(selectRoundCompleted)
  const gameEnded = useAppSelector(selectGameEnded)
  const servableIndexes = useAppSelector(selectServableSongIndexes)
  const isBusy = useAppSelector(selectIsBusy)

  const isUnlocked = (index: number) =>
    gameEnded || servableIndexes.includes(index)

  const buttonClass = (index: number) => {
    if (activeIndex === index) {
      return 'song-button active'
    }
    return isUnlocked(index) ? 'song-button' : 'song-button disabled'
  }

  return (
    <div className='song-selector'>
      {Array.from({ length: totalSongs }, (_, index) => (
        <motion.button
          {...ICON_BUTTON_MOTION}
          disabled={!isUnlocked(index)}
          key={index}
          onClick={() => dispatch(setActiveIndex(index))}
          className={buttonClass(index)}
        >
          {index + 1}
        </motion.button>
      ))}
      {!roundCompleted && !gameEnded && (
        <motion.button
          className='skip-button'
          onClick={onSkip}
          disabled={isBusy}
          whileTap={ICON_BUTTON_MOTION.whileTap}
        >
          <FaForward size={SKIP_ICON_SIZE} />
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
