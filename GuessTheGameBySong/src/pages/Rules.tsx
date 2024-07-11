import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setAnimationType } from '../store/store'

const Rules = () => {
  const dispatch = useDispatch()
  return (
    <div className='intro-box'>
      <div className='rule-box'>
        <Link onClick={() => dispatch(setAnimationType('left'))} to='/'>
          <button
            className='navigation-button'
            style={{ left: '0px', color: 'white' }}
          >
            <FaAngleLeft size={100} color='white' />
            <span>HOME</span>
          </button>
        </Link>
        <Link onClick={() => dispatch(setAnimationType('appear'))} to='/game'>
          <button
            className='navigation-button'
            style={{ right: '0px', color: 'white' }}
          >
            <FaAngleRight size={100} color='white' />
            <span>START</span>
          </button>
        </Link>
        <h2 className='rules-header'>Rules:</h2>
        <ul className='rules-list'>
          <li>You get 1 point each time you correctly guess the game.</li>
          <li>You have 5 lives, each wrong guess take 1 live.</li>
          <li className='powerup-rule'>
            After correctly guessing song in 1 attempt you get{' '}
            <span>"Power up point"</span> to use, you can:
            <p>Restore 1 health.</p>
            <p>
              Skip the current guess (you do not earn a point by doing that)
            </p>
            <p>Unlock all songs in the round</p>
            <p>
              Protect yourself from 3 wrong guesses (you do not unlock next
              songs)
            </p>
            <p>
              You can store them to get additional points (1 point per "Power
              up")
            </p>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Rules
