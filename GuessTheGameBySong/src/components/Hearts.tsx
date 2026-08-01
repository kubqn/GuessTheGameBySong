import './css/hearts.css'
import { useEffect, useState } from 'react'
import { FaHeart } from 'react-icons/fa'
import { useAppSelector } from '../store/hooks'
import { selectLives, selectMaxLives } from '../store/selectors'

const HEART_SIZE = 24
const FADE_OUT_MS = 500
const FULL_HEART_COLOR = 'red'
const EMPTY_HEART_COLOR = 'black'

const Hearts = () => {
  const currentLife = useAppSelector(selectLives)
  const maxLife = useAppSelector(selectMaxLives)
  const [disappearingHeart, setDisappearingHeart] = useState<number | null>(
    null
  )

  useEffect(() => {
    setDisappearingHeart(currentLife)
    const timer = setTimeout(() => setDisappearingHeart(null), FADE_OUT_MS)
    return () => clearTimeout(timer)
  }, [currentLife])

  return (
    <div>
      <div className='hearts-container'>
        {Array.from({ length: maxLife }, (_, index) => (
          <FaHeart
            key={index}
            size={HEART_SIZE}
            className={`heart-icon ${
              index === disappearingHeart ? 'fade-out' : ''
            }`}
            style={{
              color:
                index < currentLife ? FULL_HEART_COLOR : EMPTY_HEART_COLOR,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default Hearts
