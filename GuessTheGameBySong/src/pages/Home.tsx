import { Link } from 'react-router-dom'
import { setAnimationType } from '../store/store'
import { useAppDispatch } from '../store/hooks'
import { PageAnimation } from '../store/types'

const Home = () => {
  const dispatch = useAppDispatch()
  return (
    <div className='intro-box'>
      <div className='game-box'>
        <h1 className='title'>Welcome to Guess the Game by Song</h1>
        <p className='rules-section'>
          <Link to='/rules' style={{ textDecoration: 'none' }}>
            <span
              onClick={() => dispatch(setAnimationType(PageAnimation.Left))}
            >
              Click here{' '}
            </span>
          </Link>
          to read the rules
        </p>
        <Link to='/game'>
          <button
            onClick={() => dispatch(setAnimationType(PageAnimation.Appear))}
            className='button-common'
          >
            Start
          </button>
        </Link>
      </div>
    </div>
  )
}

export default Home
