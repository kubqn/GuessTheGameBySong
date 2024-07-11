import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setAnimationType } from '../store/store'

const Home = () => {
  const dispatch = useDispatch()
  return (
    <div className='intro-box'>
      <div className='game-box'>
        <h1 className='title'>Welcome to Guess the Game by Song</h1>
        <p className='rules-section'>
          <Link to='/rules' style={{ textDecoration: 'none' }}>
            <span onClick={() => dispatch(setAnimationType('left'))}>
              Click here{' '}
            </span>
          </Link>
          to read the rules
        </p>
        <Link to='/game'>
          <button
            onClick={() => dispatch(setAnimationType('appear'))}
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
