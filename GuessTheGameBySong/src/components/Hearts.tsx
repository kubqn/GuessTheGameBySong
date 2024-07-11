import './css/hearts.css'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { FaHeart } from 'react-icons/fa'
import { RootState } from '../store/store'

const Hearts = () => {
  const MAX_LIFE = 5
  const currentLife = useSelector((state: RootState) => state.app.life)
  const [disappearingHeart, setDisappearingHeart] = useState<number | null>(
    null
  )

  useEffect(() => {
    setDisappearingHeart(currentLife)
    const timer = setTimeout(() => {
      setDisappearingHeart(null)
    }, 500)
    return () => clearTimeout(timer)
  }, [currentLife])

  return (
    <div>
      <div className='hearts-container'>
        {Array(MAX_LIFE)
          .fill(0)
          .map((_, index) => (
            <FaHeart
              key={index}
              size={24}
              className={`heart-icon ${
                index === disappearingHeart ? 'fade-out' : ''
              }`}
              style={{ color: index < currentLife ? 'red' : 'black' }}
            />
          ))}
      </div>
    </div>
  )
}

export default Hearts
